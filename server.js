const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create Express application
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store connected users
const users = new Set();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle user join
  socket.on('user join', (username) => {
    // Validate username
    if (!username || users.has(username)) {
      socket.emit('username error', 'Username is invalid or already in use');
      return;
    }

    // Add user to the set of connected users
    users.add(username);
    socket.username = username;

    // Broadcast user join to all clients
    io.emit('user joined', {
      username: username,
      userCount: users.size
    });
  });

  // Handle chat messages
  socket.on('chat message', (message) => {
    // Broadcast message to all clients except sender
    io.emit('chat message', {
      username: socket.username,
      message: message,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      users.delete(socket.username);
      
      // Broadcast user left to all clients
      io.emit('user left', {
        username: socket.username,
        userCount: users.size
      });
    }
    console.log('Client disconnected');
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
