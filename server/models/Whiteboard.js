const mongoose = require('mongoose');

const whiteboardSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    name: { type: String, default: 'Untitled Whiteboard' },
    ownerId: { type: String, required: true },
    thumbnail: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Whiteboard', whiteboardSchema);
