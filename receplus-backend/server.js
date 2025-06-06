const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const helmet = require('helmet'); //  Encabezados de seguridad

dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet()); //  Aplica encabezados HTTP seguros automáticamente
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

// 🛡️ Protección CSRF habilitada para rutas sensibles
const csrfProtection = csrf({ cookie: true });

// Token CSRF disponible para frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Aplicar CSRF a rutas específicas
app.use('/api/contact', csrfProtection);
app.use('/api/preferences', csrfProtection);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error al conectar MongoDB:', err));

// Rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const recipeRoutes = require('./routes/recipe.routes');
const contactRoutes = require('./routes/contact.routes');
const preferenceRoutes = require('./routes/preference.routes');
const paypalRoutes = require('./routes/paypal.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/paypal', paypalRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
