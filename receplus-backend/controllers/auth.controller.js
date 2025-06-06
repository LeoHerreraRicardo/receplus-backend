const validator = require('validator'); // ← Validaciones contra entradas maliciosas
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  //  VALIDACIONES: sanitizamos y validamos los campos
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();
  const name = req.body.name?.trim();

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: 'Correo inválido' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Contraseña demasiado corta' });
  }
  if (!name || !validator.isAlpha(name.replace(/\s/g, ''), 'es-ES')) {
    return res.status(400).json({ message: 'Nombre inválido' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'El correo ya está registrado.' });
// se utiliza bcrypt para hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);
    //se guarda el hash de la contraseña en la base de datos
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, membership: user.membership }, process.env.JWT_SECRET, { expiresIn: '7d' });

    //  COOKIES SEGURAS: el token se guarda como cookie protegida
    res
      .cookie('token', token, {
        httpOnly: true,       // No accesible desde JavaScript del navegador
        secure: true,         // Solo se envía por HTTPS
        sameSite: 'Strict',   // No se envía entre sitios distintos
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      })
      .json({
        message: 'Inicio de sesión exitoso.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          membership: user.membership
        }
      });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};

exports.login = async (req, res) => {
  //  VALIDACIONES: sanitizamos email y password
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: 'Correo inválido' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Contraseña inválida' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
// se utiliza bcrypt para comparar la contraseña ingresada con el hash guardado
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    //  COOKIES SEGURAS: guardar token JWT en cookie
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({
        message: 'Inicio de sesión exitoso.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          membership: user.membership
        }
      });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};
