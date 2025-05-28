const express = require('express');
const router = express.Router();

const Product = require('../models/Product'); 
const Cart = require('../models/Cart');       




router.get('/products', async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query
    } = req.query;

  
    const filter = query
      ? {
          $or: [
            { category: { $regex: query, $options: 'i' } },
            { status: query === 'true' ? true : query === 'false' ? false : undefined }
          ].filter(Boolean)
        }
      : {};

    const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

    const result = await Product.paginate(filter, {
      page,
      limit,
      sort: sortOption,
      lean: true
    });

    
    let cart = await Cart.findOne().lean();

    if (!cart) {
      cart = await Cart.create({ products: [] });
    }


    res.render('home', {
      products: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}` : null,
      nextLink: result.hasNextPage ? `/products?page=${result.nextPage}` : null,
      query,
      sort,
      limit,
      cartId: cart._id.toString() 
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar productos');
  }
});

  



router.get('/products/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await Product.findById(productId).lean();
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        const cart = await Cart.findOne().lean();

    if (!cart) {
      const newCart = await Cart.create({ products: [] });
      return res.render('productDetail', { product, cartId: newCart._id.toString() });
    }

    res.render('productDetail', { product, cartId: cart._id.toString() });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

router.get('/carts/:cid', async (req, res) => {
    try {
      const cart = await Cart.findById(req.params.cid).populate('products.product');
  
      if (!cart) {
        return res.status(404).send('Carrito no encontrado');
      }
  
      const validProducts = cart.products.filter(item => item.product !== null);
  
      const products = validProducts.map(item => ({
        _id: item.product._id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      }));
  
      res.render('cart', { cart: { _id: cart._id, products } });
      
    } catch (error) {
      res.status(500).send('Error al cargar carrito');
    }
  });
  

module.exports = router;

