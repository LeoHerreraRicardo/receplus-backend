const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // ← Aquí se guarda ya hasheada desde el controlador
  membership: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);
