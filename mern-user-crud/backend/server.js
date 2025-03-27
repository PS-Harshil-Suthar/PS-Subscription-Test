const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Allow CORS for both local development and production
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', // Vite's default port for local development
      'https://reactdemoappdeploy.azurewebsites.net/', // Production URL (fixed typo)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

app.set('io', io);

// API routes (place these before the catch-all route)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));