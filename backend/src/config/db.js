/**
 * @module config/db
 * @description Módulo de configuración para la conexión a MongoDB
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @function connectDB
 * @async
 * @description Establece la conexión con la base de datos MongoDB utilizando
 * la URI especificada en las variables de entorno (process.env.MONGO_URI).
 * @returns {Promise<void>} No retorna valor, pero registra en consola el estado de la conexión
 * @throws {Error} Si la conexión falla, registra el error y termina el proceso
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

/**
 * Exporta la función de conexión a la base de datos
 * @exports connectDB
 */
module.exports = connectDB;