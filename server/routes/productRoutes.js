const express = require('express');
const Product = require('../models/Product');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const auth = require('../middlewares/auth');
const router = express.Router();

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
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Formato no soportado: ${file.mimetype}. Usá JPG, PNG o WebP.`));
  }
});

const handleUpload = (req, res, next) => {
  upload.array('imagenes', 10)(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'La imagen supera el límite de 10MB' });
    if (err) return res.status(400).json({ error: err.message || 'Error al subir imagen' });
    next();
  });
};

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
router.post('/', auth, handleUpload, async (req, res) => {
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
      sku,
      tipo: req.body.tipo || 'normal',
      imagen_config: req.body.imagen_config || 'cover|center',
      promo_lanzamiento: req.body.promo_lanzamiento === 'true'
    };
    
    // Parsear variantes de talles
    if (req.body.variantes) {
      try {
        productData.variantes = JSON.parse(req.body.variantes);
      } catch (e) {
        console.log('No se pudieron parsear las variantes');
      }
    }

    const productId = await Product.create(productData);
    const newProduct = await Product.getById(productId);
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: error.message || 'Error al crear producto' });
  }
});

// PUT /api/products/:id - Actualizar producto (solo admin)
router.put('/:id', auth, handleUpload, async (req, res) => {
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
      stock: req.body.stock,
      tipo: req.body.tipo || 'normal',
      imagen_config: req.body.imagen_config || 'cover|center',
      promo_lanzamiento: req.body.promo_lanzamiento === 'true'
    };
    
    // Parsear variantes de talles
    if (req.body.variantes) {
      try {
        productData.variantes = JSON.parse(req.body.variantes);
      } catch (e) {
        console.log('No se pudieron parsear las variantes');
      }
    }

    // URLs de Cloudinary para actualización
    // Si vienen imágenes existentes reordenadas, usarlas como base
    let baseImages = [];
    if (req.body.imagenes_existentes) {
      try { baseImages = JSON.parse(req.body.imagenes_existentes); } catch {}
    }
    const newImages = req.files && req.files.length > 0 ? req.files.map(f => f.path) : [];
    if (baseImages.length > 0 || newImages.length > 0) {
      productData.imagenes = [...baseImages, ...newImages];
    }

    await Product.update(id, productData);
    const updatedProduct = await Product.getById(id);
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar producto' });
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