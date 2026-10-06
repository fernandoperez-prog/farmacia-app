# Farmacia App – Laboratorio FullStack (JWT + Sequelize + EJS)

## Requisitos
- Node.js 18+
- MySQL 8 (o MariaDB) en ejecución

## Ejecución local
```bash
cd farmacia-app
npm install
cp .env.example .env      # edita DB_USER / DB_PASS / JWT_SECRET
npm start
```
Abre http://localhost:4000

Al iniciar, Sequelize **crea la base `bd_Farmacia`**, las tablas (`usuarios`, `tipomedic`, `medicamento`),
sus relaciones y **inserta registros de ejemplo**.

Usuarios de prueba (clave `123456`): `admin`, `moderador`, `usuario`.

## Estructura
| Carpeta | Contenido |
|---|---|
| `config/db.js` | Conexión Sequelize + creación de la BD |
| `models/index.js` | Modelos y relación TipoMedic 1—N Medicamento |
| `middleware/auth.js` | Verificación de JWT y roles |
| `routes/auth.js` | Registro, login, logout (JWT en cookie httpOnly) |
| `routes/api.js` | CRUD con Sequelize |
| `views/` | Plantillas EJS (header/footer reutilizables) |
| `public/js/` | Validaciones y lógica del front-end |

## Permisos por rol
| Rol | Ver | Crear/Editar | Eliminar | Usuarios |
|---|---|---|---|---|
| admin | sí | sí | sí | sí |
| moderator | sí | sí | no | no |
| user | sí | no | no | no |

## Despliegue (Render + MySQL en la nube)
1. Sube el proyecto a GitHub (sin `.env`).
2. Crea una base MySQL gratuita (Aiven, Railway, etc.) y copia host, puerto, usuario y clave.
3. En https://render.com crea un **Web Service** desde tu repo:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. En Environment agrega: `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.
5. Al terminar el deploy, comparte el link `https://tu-app.onrender.com`.
