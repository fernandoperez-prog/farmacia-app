require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const { crearBaseDeDatos } = require('./config/db');
const { sequelize, User, TipoMedic, Medicamento } = require('./models');
const { cargarUsuario, requireLoginPage } = require('./middleware/auth');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cargarUsuario);

// ---------- API ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// ---------- Páginas (plantillas EJS) ----------
app.get('/', (req, res) => res.redirect(req.user ? '/menu' : '/login'));
app.get('/login', (req, res) => (req.user ? res.redirect('/menu') : res.render('login', { title: 'Iniciar sesión' })));
app.get('/register', (req, res) => (req.user ? res.redirect('/menu') : res.render('register', { title: 'Registro' })));
app.get('/menu', requireLoginPage, (req, res) => res.render('menu', { title: 'Menú principal' }));
app.get('/medicamentos', requireLoginPage, (req, res) => res.render('medicamentos', { title: 'Medicamentos' }));
app.get('/tipos', requireLoginPage, (req, res) => res.render('tipos', { title: 'Tipos de medicamento' }));
app.get('/usuarios', requireLoginPage, (req, res) => {
  if (req.user.role !== 'admin') return res.redirect('/menu');
  res.render('usuarios', { title: 'Usuarios' });
});

// ---------- Datos iniciales ----------
async function sembrarDatos() {
  if ((await User.count()) === 0) {
    const hash = await bcrypt.hash('123456', 10);
    await User.bulkCreate([
      { username: 'admin', email: 'admin@farmacia.com', password: hash, role: 'admin' },
      { username: 'moderador', email: 'mod@farmacia.com', password: hash, role: 'moderator' },
      { username: 'usuario', email: 'user@farmacia.com', password: hash, role: 'user' },
    ]);
  }
  if ((await TipoMedic.count()) === 0) {
    const tipos = await TipoMedic.bulkCreate([
      { descripcion: 'Analgésico' },
      { descripcion: 'Antibiótico' },
      { descripcion: 'Antiinflamatorio' },
    ]);
    await Medicamento.bulkCreate([
      { descripcionMed: 'Paracetamol 500mg', fechaFabricacion: '2026-01-10', fechaVencimiento: '2028-01-10', Presentacion: 'Caja x 100', stock: 120, precioVentaUni: 0.50, precioVentaPres: 45.00, Marca: 'Genfar', CodTipoMed: tipos[0].CodTipoMed },
      { descripcionMed: 'Amoxicilina 500mg', fechaFabricacion: '2026-03-05', fechaVencimiento: '2028-03-05', Presentacion: 'Caja x 50', stock: 80, precioVentaUni: 1.20, precioVentaPres: 55.00, Marca: 'Portugal', CodTipoMed: tipos[1].CodTipoMed },
      { descripcionMed: 'Ibuprofeno 400mg', fechaFabricacion: '2026-02-15', fechaVencimiento: '2028-02-15', Presentacion: 'Caja x 100', stock: 95, precioVentaUni: 0.80, precioVentaPres: 70.00, Marca: 'Bayer', CodTipoMed: tipos[2].CodTipoMed },
    ]);
  }
}

// ---------- Arranque ----------
const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await crearBaseDeDatos();          // crea bd_Farmacia
    await sequelize.sync();            // crea tablas y relaciones
    await sembrarDatos();              // inserta registros iniciales
    app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));
  } catch (e) {
    console.error('Error al iniciar:', e);
    process.exit(1);
  }
})();
