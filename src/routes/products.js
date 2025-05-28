const express = require('express');
const Product = require('../models/Product');

module.exports = function(io) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const limitRaw = req.query.limit;
      const pageRaw = req.query.page;
  
      const limit = Number(limitRaw);
      const finalLimit = (!limit || isNaN(limit) || limit <= 0) ? 10 : limit;
  
      const page = Number(pageRaw);
      const finalPage = (!page || isNaN(page) || page <= 0) ? 1 : page;
  
      const sort = req.query.sort;
      const query = req.query.query;
  
      const filter = query ? {
        $or: [
          { category: query },
          { status: query === 'true' ? true : query === 'false' ? false : undefined }
        ].filter(Boolean)
      } : {};
  
      const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
  
      const options = {
        page: finalPage,
        limit: finalLimit,
        sort: sortOptions,
        lean: true
      };
  
      const result = await Product.paginate(filter, options);
  
      res.json({
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
        nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null
      });
    } catch (error) {
      res.status(500).json({ status: 'error', error: 'Error al obtener productos' });
    }
  });
  
  

  router.get('/:pid', async (req, res) => {
    try {
      const product = await Product.findById(req.params.pid);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el producto' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const newProduct = await Product.create(req.body);
      const updatedList = await Product.find();
      io.emit('productList', updatedList);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.put('/:pid', async (req, res) => {
    try {
      const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  });

  router.delete('/:pid', async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.pid);
      const updatedList = await Product.find();
      io.emit('productList', updatedList);
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  });

  return router;
};
