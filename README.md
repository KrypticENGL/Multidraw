# Multidraw

A collaborative real-time whiteboard application that enables multiple users to draw, create shapes, and collaborate seamlessly. Built with React and Node.js, Multidraw leverages cutting-edge technologies to provide a smooth and responsive drawing experience.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Konva](https://img.shields.io/badge/Konva-10.2.0-0D83CD?style=for-the-badge&logo=konva&logoColor=white)
![Yjs](https://img.shields.io/badge/Yjs-13.6.29-FFA500?style=for-the-badge&logo=yjs&logoColor=white)

## Features

- **Real-time Collaboration**: Multiple users can draw and edit simultaneously with instant synchronization
- **Drawing Tools**: Comprehensive set of drawing tools including freehand drawing and shape creation
- **Canvas Manipulation**: Pan and zoom functionality for navigating large canvases
- **Persistent Storage**: Whiteboards are saved to MongoDB with automatic synchronization
- **User Authentication**: Secure authentication powered by Firebase
- **Thumbnail Previews**: Quick visual previews of whiteboards

## Technology Stack

### Client
- **React 19** - Modern UI framework
- **Vite** - Fast development build tool
- **Konva & React-Konva** - High-performance 2D canvas rendering
- **Yjs** - CRDT-based real-time collaboration framework
- **Socket.IO Client** - WebSocket communication
- **Firebase** - Authentication and user management
- **React Router** - Client-side routing

### Server
- **Node.js & Express** - Backend server framework
- **Socket.IO** - Real-time bidirectional communication
- **Yjs & y-websocket** - Collaborative editing backend
- **MongoDB & Mongoose** - Database and ODM
- **Firebase Admin** - Server-side Firebase integration
- **y-mongodb-provider** - Yjs persistence layer for MongoDB

## Project Structure

```
📦 Multidraw
│
├─── 📂 client/                    # Frontend Application
│    │
│    ├─── 📂 public/               # Static assets
│    │    ├─── 🖼️  vite.svg
│    │    └─── 🖼️  unnamed.jpg
│    │
│    ├─── 📂 src/                  # Source code
│    │    ├─── 📂 components/      # React components
│    │    │    ├─── ⚛️  HomePage.jsx
│    │    │    ├─── 🎨 HomePage.css
│    │    │    ├─── ⚛️  LandingPage.jsx
│    │    │    ├─── 🎨 LandingPage.css
│    │    │    ├─── ⚛️  Navbar.jsx
│    │    │    ├─── 🎨 Navbar.css
│    │    │    ├─── ⚛️  Whiteboard.jsx
│    │    │    └─── 🎨 Whiteboard.css
│    │    │
│    │    ├─── 🔥 firebase.js      # Firebase configuration
│    │    ├─── ⚛️  App.jsx          # Root component
│    │    └─── ⚛️  main.jsx         # Entry point
│    │
│    ├─── 🌐 index.html            # HTML template
│    ├─── ⚙️  vite.config.js        # Vite configuration
│    └─── 📦 package.json          # Client dependencies
│
├─── 📂 server/                    # Backend Application
│    │
│    ├─── 📂 models/               # Database models
│    │    └─── 🗄️  Whiteboard.js    # Whiteboard schema
│    │
│    ├─── 🚀 index.js              # Server entry point
│    ├─── 📦 package.json          # Server dependencies
│    ├─── ⚙️  nodemon.json          # Nodemon configuration
│    ├─── 🐛 debug-mongo.js        # MongoDB debug utility
│    └─── 🧪 test-mongo.js         # MongoDB test script

```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance (local or cloud)
- Firebase project credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Multidraw
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Configure environment variables:

Create a `.env` file in the `server` directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3001
```

Create a `.env` file in the `client` directory with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the client:
```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite)

## Usage

1. Sign in using your credentials via Firebase authentication
2. Create a new whiteboard or join an existing one
3. Use the drawing tools to create content
4. Invite collaborators to work together in real-time
5. Your changes are automatically saved and synchronized across all connected clients

## Development

### Client Development
```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server Development
```bash
cd server
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start in production mode
```

## Future Development

More features and enhancements will be added in the upcoming future to improve functionality and user experience.

## License

This project is licensed under the ISC License.

## Contributing

Contributions are welcome. Please ensure your code follows the existing style and includes appropriate tests.
