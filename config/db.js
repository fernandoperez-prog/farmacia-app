require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

const { DB_HOST = 'localhost', DB_PORT = 3306, DB_USER = 'root', DB_PASS = '', DB_NAME = 'bd_Farmacia' } = process.env;

// SSL solo cuando no es local (TiDB lo exige)
const usaSSL = DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1';
const ssl = usaSSL ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: ssl ? { ssl } : {},
});

async function crearBaseDeDatos() {
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS, ssl });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

module.exports = { sequelize, crearBaseDeDatos };