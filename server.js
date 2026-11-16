require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Blog API is running' }));
app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Only listen when running locally (Vercel handles this itself)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;