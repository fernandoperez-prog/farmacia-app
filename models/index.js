const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// ---------- Usuario (autenticación + roles) ----------
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(100), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'moderator', 'user'), allowNull: false, defaultValue: 'user' },
}, { tableName: 'usuarios' });

// ---------- Tabla 1: TipoMedic ----------
const TipoMedic = sequelize.define('TipoMedic', {
  CodTipoMed: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'tipomedic', timestamps: false });

// ---------- Tabla 2: Medicamento ----------
const Medicamento = sequelize.define('Medicamento', {
  CodMedicamento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcionMed: { type: DataTypes.STRING(150), allowNull: false },
  fechaFabricacion: { type: DataTypes.DATEONLY, allowNull: false },
  fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: false },
  Presentacion: { type: DataTypes.STRING(60) },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  precioVentaUni: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  precioVentaPres: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  Marca: { type: DataTypes.STRING(60) },
}, { tableName: 'medicamento', timestamps: false });

// ---------- Relación 1:N ----------
// Un TipoMedic tiene muchos Medicamento; cada Medicamento pertenece a un TipoMedic (FK CodTipoMed)
TipoMedic.hasMany(Medicamento, { foreignKey: { name: 'CodTipoMed', allowNull: false }, onDelete: 'RESTRICT' });
Medicamento.belongsTo(TipoMedic, { foreignKey: 'CodTipoMed' });

module.exports = { sequelize, User, TipoMedic, Medicamento };
