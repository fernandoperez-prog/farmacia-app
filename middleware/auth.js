const jwt = require('jsonwebtoken');

function leerToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return req.cookies && req.cookies.token;
}

// Adjunta req.user y res.locals.user (para que la barra de navegación cambie según el rol)
function cargarUsuario(req, res, next) {
  res.locals.user = null;
  const token = leerToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = req.user;
    } catch (e) { /* token inválido o vencido */ }
  }
  next();
}

// Para páginas: redirige al login
function requireLoginPage(req, res, next) {
  if (!req.user) return res.redirect('/login');
  next();
}

// Para la API: responde 401
function requireLoginApi(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    next();
  };
}

module.exports = { cargarUsuario, requireLoginPage, requireLoginApi, requireRole };
