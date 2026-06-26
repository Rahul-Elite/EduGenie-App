const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studyRoutes = require('./routes/studyRoute');
const compilerRoutes = require('./routes/compilerRoute');
const testRoutes = require('./routes/testRoute');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api', studyRoutes);
app.use('/api', testRoutes);
app.use('/api/compiler', compilerRoutes);

const MONGO_URI = process.env.MONGO_URI || 'your_mongodb_atlas_connection_string_here';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Authentication API is running' });
});
