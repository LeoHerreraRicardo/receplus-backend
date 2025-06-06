const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const validator = require('validator'); //  Se importa validator para validar y sanitizar los datos

//  Ruta para guardar un mensaje de contacto
router.post('/', async (req, res) => {
  // 🔒 VALIDACIÓN: extraemos y validamos cada campo manualmente
  const { nombre, apellido, correo, asunto, mensaje } = req.body;

  if (
    !validator.isAlpha(nombre.replace(/\s/g, ''), 'es-ES') ||           // Solo letras y espacios
    !validator.isAlpha(apellido.replace(/\s/g, ''), 'es-ES') ||         // Solo letras y espacios
    !validator.isEmail(correo) ||                                       // Verifica formato de email
    validator.contains(mensaje, '<script>')                             // Prevenir intento de inyección JS
  ) {
    return res.status(400).json({ message: 'Datos no válidos' });
  }

  try {
    //  Si pasa validación, se crea el nuevo documento de contacto
    const nuevoMensaje = new Contact({
      nombre,
      apellido,
      correo,
      asunto,
      mensaje,
      esUsuario: req.body.esUsuario
    });

    await nuevoMensaje.save();
    res.status(201).json({ message: 'Mensaje guardado correctamente' });
  } catch (err) {
    console.error('Error al guardar contacto:', err);
    res.status(500).json({ message: 'Error al guardar contacto' });
  }
});

//  Ruta para obtener todos los mensajes guardados
router.get('/', async (req, res) => {
  try {
    const mensajes = await Contact.find().sort({ fecha: -1 }); // Más recientes primero
    res.json(mensajes);
  } catch (err) {
    console.error('Error al obtener mensajes:', err);
    res.status(500).json({ message: 'Error al obtener los mensajes' });
  }
});

module.exports = router;
