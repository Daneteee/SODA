const User = require('../../models/user');

// Toggle a symbol in the user's favs array
exports.toggleFavorite = async (req, res) => {
  const userId = req.user.id;              // set by authMiddleware
  const { symbol } = req.params;           // e.g. PATCH /api/favorites/AAPL
  
  if (!symbol || symbol === "undefined") {
    return res.status(400).json({ msg: "Símbolo inválido" });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const idx = user.favs.indexOf(symbol);
    if (idx === -1) {
      // not in favs → add
      user.favs.push(symbol);
    } else {
      // already in favs → remove
      user.favs.splice(idx, 1);
    }

    await user.save();
    res.json({ favs: user.favs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favs');
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ favs: user.favs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};
