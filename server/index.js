const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Y = require('yjs');
const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils');
const { MongodbPersistence } = require('y-mongodb-provider');
const Whiteboard = require('./models/Whiteboard');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

// fetch all whiteboards
app.get('/api/whiteboards', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { ownerId: userId } : {};
    const boards = await Whiteboard.find(query).sort({ createdAt: -1 });
    res.json(boards);
  } catch (err) {
    console.error('Error fetching whiteboards:', err);
    res.status(500).json({ error: 'Failed to fetch whiteboards' });
  }
});

app.post('/api/whiteboards', async (req, res) => {
  try {
    const { roomId, name, ownerId } = req.body;
    if (!roomId || !ownerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newBoard = await Whiteboard.create({ roomId, name, ownerId });
    res.status(201).json(newBoard);
  } catch (err) {
    console.error('Error creating whiteboard:', err);
    res.status(500).json({ error: 'Failed to create whiteboard' });
  }
});

// update whiteboard (thumbnail)
app.put('/api/whiteboards/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { thumbnail } = req.body;
    const updated = await Whiteboard.findOneAndUpdate(
      { roomId },
      { thumbnail },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating whiteboard:', err);
    res.status(500).json({ error: 'Failed to update whiteboard' });
  }
});

// delete whiteboard
app.delete('/api/whiteboards/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    await Whiteboard.deleteOne({ roomId });
    // access the native mongo driver to delete from yjs collection
    if (mongoose.connection.db) {
      await mongoose.connection.db.collection('yjs-transactions').deleteMany({ docName: roomId });
    }
    res.json({ message: 'Whiteboard deleted' });
  } catch (err) {
    console.error('Error deleting whiteboard:', err);
    res.status(500).json({ error: 'Failed to delete whiteboard' });
  }
});

const server = http.createServer(app);

// Setup WebSocket server for Yjs with CORS support
const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    console.log('WebSocket connection attempt from origin:', info.origin);
    return true;
  }
});

// Persistence Configuration
if (process.env.MONGO_URI) {
  try {
    const mdb = new MongodbPersistence(process.env.MONGO_URI, {
      collectionName: 'yjs-transactions',
      flushSize: 100,
      multipleCollections: true
    });

    setPersistence({
      bindState: async (docName, ydoc) => {
        // Load persisted data
        const persistedYdoc = await mdb.getYDoc(docName);
        const newUpdates = Y.encodeStateAsUpdate(ydoc);
        mdb.storeUpdate(docName, newUpdates);
        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

        // Ensure metadata exists
        try {
          const exists = await Whiteboard.findOne({ roomId: docName });
          if (!exists) {
            const name = docName.startsWith('room-') ? 'Untitled Whiteboard' : docName;
            await Whiteboard.create({ roomId: docName, name });
          }
        } catch (err) {
          console.error('Metadata creation error:', err);
        }
      },
      writeState: async (docName, ydoc) => {
        await mdb.storeUpdate(docName, Y.encodeStateAsUpdate(ydoc));
      }
    });
    console.log('Persistence configured');
  } catch (err) {
    console.error('Failed to setup persistence:', err);
  }
}

wss.on('connection', (ws, req) => {
  console.log('Client connected');
  setupWSConnection(ws, req);
});

const PORT = process.env.PORT || 3002;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for Yjs connections (using y-websocket utils)`);
});
