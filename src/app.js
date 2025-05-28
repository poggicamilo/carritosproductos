const express = require('express');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');
const http = require('http');


const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server); 

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

const ProductManager = require('./ProductManager');
const productManager = new ProductManager('products.json');
const connectDB = require('./db'); 

connectDB(); 



app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const hbs = exphbs.create({
  defaultLayout: 'main', 
  extname: '.handlebars', 
  helpers: {
    eq: (a, b) => a === b,
    multiply: (a, b) => a * b,
  },
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsRouter(io)); 
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);


io.on('connection', async (socket) => {
    console.log('Cliente conectado con WebSocket');

    const products = await productManager.getProducts();
    socket.emit('productList', products);
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
