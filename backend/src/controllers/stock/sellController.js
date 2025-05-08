const User = require('../../models/user');
const Stock = require('../../models/stock');
const Transaction = require('../../models/transaction'); // Asegúrate de tener este modelo
const { isMarketOpen } = require('../../utils/marketHours');

// Función para procesar la venta de acciones
const sellStock = async (req, res) => {
  const { symbol, quantity, sellPrice } = req.body;
  console.log("Datos recibidos para venta:", req.body);

  // Verificar si el mercado está abierto
  if (!isMarketOpen()) {
    return res.status(400).json({ message: 'El mercado está cerrado. Las operaciones solo están disponibles durante el horario de mercado (9:30 AM - 4:00 PM ET, Lunes a Viernes)' });
  }

  if (symbol == null || quantity == null || sellPrice == null) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }
  if (quantity <= 0) {
    return res.status(400).json({ message: 'La cantidad debe ser mayor que 0' });
  }

  try {
    // Verificar que el stock existe en la base de datos
    const stockInfo = await Stock.findOne({ symbol });
    if (!stockInfo) {
      return res.status(404).json({ message: 'Stock no encontrado' });
    }

    // Obtener el usuario autenticado
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Buscar la posición existente en el portafolio del usuario
    const existingStock = user.stocks.find((s) => s.symbol === symbol);
    if (!existingStock) {
      return res.status(400).json({ message: 'No posees acciones de este stock' });
    }
    if (quantity > existingStock.quantity) {
      return res.status(400).json({ message: 'No tienes suficientes acciones para vender' });
    }

    // Calcular el ingreso total de la venta
    const totalRevenue = sellPrice * quantity;

    // Actualizar el crédito del usuario sumando el ingreso de la venta
    user.credit += totalRevenue;

    // Actualizar o eliminar la posición en el portafolio
    if (quantity === existingStock.quantity) {
      user.stocks = user.stocks.filter((s) => s.symbol !== symbol);
    } else {
      existingStock.quantity -= quantity;
    }

    // Guardar los cambios en el usuario
    await user.save();

    // Crear y guardar la transacción
    const transaction = new Transaction({
      userId: req.user.id,
      stock: symbol,
      type: "sell",
      amount: quantity,
      price: sellPrice,
      total: totalRevenue,
      date: new Date()
    });
    await transaction.save();

    return res.status(200).json({ message: 'Venta realizada exitosamente', user, transaction });
  } catch (error) {
    console.error("Error en la venta: ", error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { sellStock };