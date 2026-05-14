require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'TeamFlow API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

async function seedSuperAdmin() {
  const exists = await User.findOne({ email: 'outreach@ethara.ai' });
  if (!exists) {
    const hashed = await bcrypt.hash('outreach@ethara.ai', 10);
    await User.create({
      name: 'Super Admin',
      email: 'outreach@ethara.ai',
      password: hashed,
      role: 'admin'
    });
    console.log('Super admin created: outreach@ethara.ai');
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedSuperAdmin();
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
