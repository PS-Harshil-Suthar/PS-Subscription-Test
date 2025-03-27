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
const io = new Server(server, {
  cors: { origin: 'https://reactdemodeploy-b7gedyc9bbgvere6.centralindia-01.azurewebsites.net/', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

app.set('io', io);

app.use(express.static("../../fontend/dist"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
})

app.listen(port, () => {
  console.log(`App Listening ar ${port}`);
})

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));