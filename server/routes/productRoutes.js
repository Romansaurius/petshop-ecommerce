const express = require('express');
const Product = require('../models/Product');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const auth = require('../middlewares/auth');
const router = express.Router();

// Configuración de multer para memoria (Cloudinary)
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// GET /api/products/categories - Obtener categorías
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// GET /api/products/brands - Obtener marcas
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.getBrands();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
});

// GET /api/products/featured - Obtener productos destacados
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.getFeatured();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos destacados' });
  }
});

// GET /api/products/stats/dashboard - Estadísticas para admin
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const stats = await Product.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let products;
    if (search) {
      products = await Product.search(search);
    } else if (category) {
      products = await Product.getByCategory(category);
    } else {
      products = await Product.getAll();
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/products/:id - Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/products - Crear producto (solo admin)
router.post('/', auth, upload.array('imagenes', 5), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    let imageUrls = [];
    
    // Subir imágenes a Cloudinary si existen
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'ecommerce-mascotas' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    const productData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion || '',
      precio: req.body.precio,
      categoria: req.body.categoria,
      marca: req.body.marca || null,
      imagenes: imageUrls,
      destacado: req.body.destacado === 'true',
      descuento_porcentaje: req.body.descuento_porcentaje || 0,
      stock: req.body.stock || 100
    };

    const productId = await Product.create(productData);
    const newProduct = await Product.getById(productId);
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: error.message || 'Error al crear producto' });
  }
});

// PUT /api/products/:id - Actualizar producto (solo admin)
router.put('/:id', auth, upload.array('imagenes', 5), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.params;
    const productData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      categoria: req.body.categoria,
      marca: req.body.marca,
      destacado: req.body.destacado === 'true',
      descuento_porcentaje: req.body.descuento_porcentaje || 0,
      stock: req.body.stock
    };

    // Subir nuevas imágenes a Cloudinary si existen
    if (req.files && req.files.length > 0) {
      let imageUrls = [];
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'ecommerce-mascotas' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
      productData.imagenes = imageUrls;
    }

    await Product.update(id, productData);
    const updatedProduct = await Product.getById(id);
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id - Eliminar producto (solo admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.params;
    await Product.delete(id);
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;