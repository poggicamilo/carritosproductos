const fs = require('fs').promises;

class CartManager {
    constructor(path) {
        this.path = path;
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async saveCarts(carts) {
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    }

    async createCart() {
        let carts = await this.loadCarts();

        const newCart = {
            id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
            products: []
        };

        carts.push(newCart);
        await this.saveCarts(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.loadCarts();
        return carts.find(cart => cart.id === id) || null;
    }

    async addProductToCart(cartId, productId) {
        let carts = await this.loadCarts();
        const cart = carts.find(c => c.id === cartId);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(p => p.product === productId);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity++;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await this.saveCarts(carts);
        return cart;
    }
}

module.exports = CartManager;