const express = require('express');
const Product = require('../models/Product');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middlewares/auth');
const router = express.Router();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer con Cloudinary - las imágenes se suben directamente a la nube
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce-mascotas',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
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

    // URLs de Cloudinary (permanentes)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }

    // Generar SKU automático
    const categoria = (req.body.categoria || 'otros').substring(0, 3).toUpperCase();
    const sku = `${categoria}-${Date.now().toString().slice(-6)}`;

    const productData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion || '',
      precio: req.body.precio,
      categoria: req.body.categoria,
      marca: req.body.marca || null,
      imagenes: imageUrls,
      destacado: req.body.destacado === 'true',
      descuento_porcentaje: req.body.descuento_porcentaje || 0,
      stock: req.body.stock || 100,
      sku
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

    // URLs de Cloudinary para actualización
    if (req.files && req.files.length > 0) {
      productData.imagenes = req.files.map(file => file.path);
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