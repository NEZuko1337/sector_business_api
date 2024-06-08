const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/user', authRoutes);
app.use('/profile', userRoutes);

sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('Сервер запущен на порте 3000');
    });
  })
  .catch(err => {
    console.error('Невозможно подключиться к базе данных', err);
  });
