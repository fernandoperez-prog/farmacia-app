const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

function firmar(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '2h' }
  );
}

function validar({ username, email, password }, esRegistro) {
  if (esRegistro) {
    if (!username || username.trim().length < 3) return 'El usuario debe tener al menos 3 caracteres';
    if (!/^\S+@\S+\.\S+$/.test(email || '')) return 'Correo electrónico inválido';
  }
  if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const error = validar(req.body, true);
    if (error) return res.status(400).json({ message: error });

    const { username, email, password } = req.body;
    // Para el laboratorio se permite elegir rol al registrarse; en producción solo 'user'.
    const role = ['admin', 'moderator', 'user'].includes(req.body.role) ? req.body.role : 'user';

    const existe = await User.findOne({ where: { username } }) || await User.findOne({ where: { email } });
    if (existe) return res.status(409).json({ message: 'El usuario o correo ya existe' });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username: username.trim(), email: email.trim(), password: hash, role });
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Ingresa usuario y contraseña' });

    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const token = firmar(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 2 * 60 * 60 * 1000 });
    res.json({ message: 'Login correcto', token, role: user.role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada' });
});

module.exports = router;
