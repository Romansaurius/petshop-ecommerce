const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const db = require('../config/database');

// Subir múltiples imágenes de producto
router.post('/upload-multiple/:productId', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se subieron imágenes' });
    }

    const productId = req.params.productId;
    const imageData = [];

    // Insertar cada imagen en la base de datos
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const [result] = await db.execute(
        'INSERT INTO producto_imagenes (producto_id, imagen_url, cloudinary_id, es_principal, orden) VALUES (?, ?, ?, ?, ?)',
        [productId, file.path, file.filename, i === 0, i]
      );
      
      imageData.push({
        id: result.insertId,
        url: file.path,
        cloudinaryId: file.filename,
        esPrincipal: i === 0,
        orden: i
      });
    }

    res.json({
      message: 'Imágenes subidas exitosamente',
      images: imageData
    });
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Subir imagen individual
router.post('/upload', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ninguna imagen' });
    }

    res.json({
      message: 'Imagen subida exitosamente',
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;