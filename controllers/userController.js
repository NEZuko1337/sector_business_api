const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

exports.uploadPhoto = upload.single('photo');

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { id, firstName, lastName, gender, email, password, registrationDate } = req.body;
    let photo;

    if (req.file) {
      photo = req.file.filename;
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ code: 404, message: 'Пользователь не найден' });
    }

    // Проверка на запрещенные поля
    if (password || registrationDate || id) {
      return res.status(400).json({ code: 400, message: 'Поля id, password и registrationDate нельзя изменять' });
    }

    const updates = { firstName, lastName, gender, photo, email };

    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    await User.update(updates, { where: { id: userId } });

    res.json({ code: 201, message: 'Информация о пользователе успешно обновлена' });
  } catch (error) {
    res.status(500).json({ code: 500, error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ code: 404, message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ code: 500, error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      limit,
      offset,
      order: [['registrationDate', 'DESC']]
    });

    res.json({
      totalPages: Math.ceil(users.count / limit),
      currentPage: page,
      users: users.rows
    });
  } catch (error) {
    res.status(500).json({ code: 500, error: error.message });
  }
};
