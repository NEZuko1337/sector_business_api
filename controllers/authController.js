const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.register = async (req, res) => {
  try {
    const { firstName, email, password, lastName, gender, photo } = req.body;

    if (lastName || gender || photo) {
      return res.status(400).json({code: 400, message: 'Только имя, почта, и пароль можно вводить на этапе регистрации' });
    }

    if (!firstName || !email || !password) {
      return res.status(400).json({code: 400, message: 'Имя, почта, и пароль - необходимые поля' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      email,
      password: hashedPassword
    });

    res.status(201).json({ code: 201, message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ code: 400, message: 'Почта уже используется, введите другую' });
    }
    res.status(500).json({ code: 500, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ code: 400, message: 'Необходимо ввести почту и пароль' });
    }
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ code: 401, message: 'Неверная почта или пароль' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({code: 201, token });
  } catch (error) {
    res.status(500).json({code: 500, error: error.message });
  }
};
