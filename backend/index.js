const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// CORS config
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://developer-yasir.github.io',
    process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
console.log('Backend: Attempting to connect to MongoDB at:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully TO:', mongoose.connection.name))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('👋 User disconnected:', socket.id);
    });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`🚪 User joined room: ${room}`);
    });
});

// Make io accessible to routes
app.set('socketio', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/riders', require('./routes/riders'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/fooditems', require('./routes/fooditems'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: '🍔 Befoody API - Food Delivery Platform' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
