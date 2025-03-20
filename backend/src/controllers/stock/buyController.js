// src/controllers/stock/buyController.js

const User = require('../../models/user');
const Stock = require('../../models/stock');

// Función para procesar la compra de acciones
const buyStock = async (req, res) => {
  const { symbol, quantity, purchasePrice } = req.body;
  console.log("Datos recibidos:", req.body);
  if (symbol == null || quantity == null || purchasePrice == null) {
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

    // Calcular el costo total de la operación
    const totalCost = purchasePrice * quantity;
    if (user.credit < totalCost) {
      return res.status(400).json({ message: 'Crédito insuficiente para realizar la compra' });
    }

    // Descontar el costo total del crédito del usuario
    user.credit -= totalCost;

    // Revisar si el usuario ya posee acciones con el mismo símbolo
    const existingStock = user.stocks.find((s) => s.symbol === symbol);
    if (existingStock) {
      // Promediar el precio de compra y actualizar la cantidad
      const totalQuantity = existingStock.quantity + quantity;
      const newPurchasePrice = ((existingStock.purchasePrice * existingStock.quantity) + totalCost) / totalQuantity;
      existingStock.quantity = totalQuantity;
      existingStock.purchasePrice = newPurchasePrice;
      existingStock.purchaseDate = new Date();
    } else {
      // Agregar una nueva entrada en el arreglo de stocks del usuario
      user.stocks.push({
        symbol,
        quantity,
        purchasePrice,
        purchaseDate: new Date()
      });
    }

    // Guardar los cambios en la base de datos
    await user.save();

    return res.status(200).json({ message: 'Compra realizada exitosamente', user });
  } catch (error) {
    console.error("Error en la compra: ", error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { buyStock };
