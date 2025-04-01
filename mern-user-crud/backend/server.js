// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const http = require('http');
// const { Server } = require('socket.io');
// const userRoutes = require('./routes/userRoutes');
// const authRoutes = require('./routes/authRoutes');
// const path = require('path');

// dotenv.config();
// const app = express();
// const server = http.createServer(app);

// // Allow CORS for both local development and production
// const io = new Server(server, {
//   cors: {
//     origin: [
//       'http://localhost:5173', // Vite's default port for local development
//       'https://reactdemoappdeploy.azurewebsites.net/', // Production URL (fixed typo)
//     ],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   },
// });

// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// // Socket.IO connection
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);
//   socket.on('disconnect', () => console.log('User disconnected:', socket.id));
// });

// app.set('io', io);

// // API routes (place these before the catch-all route)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

// // Serve static files from the frontend build folder
// app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// // Catch-all route for client-side routing
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));






const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', // Local development (Vite default port)
      'https://reactdemoappdeploy.azurewebsites.net', // Production URL (removed trailing slash)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow credentials if needed
  },
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://reactdemoappdeploy.azurewebsites.net',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
};

// Call the MongoDB connection function
connectToMongoDB();

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Attach Socket.IO instance to the app for use in routes if needed
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Serve static files from the React frontend build folder
const staticPath = path.join(__dirname, '..', 'frontend', 'dist');
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));

// Catch-all route for client-side routing (React Router)
app.get('*', (req, res) => {
  const indexPath = path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ message: 'Server error: Unable to serve the application.' });
    }
  });
});

// Error-handling middleware for unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
