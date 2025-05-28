const fs = require('fs').promises;
class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async saveProducts(products) {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    }

    async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
        try {

            if (!title || !description || !code || !price || !stock || !category) {
                throw new Error('Faltan campos del producto');
            }
            const products = await this.loadProducts();
    
            if (products.some(product => product.code === code)) {
                throw new Error('Ya existe un producto con ese codigo');
            }
    
            const newProduct = {
                id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
                title,
                description,
                code,
                price,
                status,
                stock,
                category,
                thumbnails
            };
    
            products.push(newProduct);
            await this.saveProducts(products);
    
            return newProduct;
        } catch (error) {
            console.error('Error al agregar el producto:', error.message);
            throw error;  
        }
    }
    

    async getProducts() {
        return await this.loadProducts();
    }

    async getProductById(id) {
        const products = await this.loadProducts();
        return products.find(product => product.id === id) || null;
    }

    async updateProduct(id, updatedFields) {
        let products = await this.loadProducts();
        const index = products.findIndex(product => product.id === id);
        if (index === -1) return null;

        products[index] = { ...products[index], ...updatedFields, id };
        await this.saveProducts(products);
        return products[index];
    }

    async deleteProduct(id) {
        let products = await this.loadProducts();
        const index = products.findIndex(product => product.id === id);
        if (index === -1) return false;

        products.splice(index, 1);
        await this.saveProducts(products);
        return true;
    }
}

module.exports = ProductManager;