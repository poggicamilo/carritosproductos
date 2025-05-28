const socket = io();

const productList = document.getElementById('productList');
const form = document.getElementById('addProductForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        title: form.title.value,
        description: form.description.value,
        code: form.code.value,
        price: parseFloat(form.price.value),
        stock: parseInt(form.stock.value),
        category: form.category.value
    };

    const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        form.reset();
    }
});

socket.on('productList', (products) => {
    productList.innerHTML = '';
    products.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>Título:</strong> ${p.title} <br>
            <strong>Descripción:</strong> ${p.description} <br>
            <strong>Código:</strong> ${p.code} <br>
            <strong>Precio:</strong> $${p.price} <br>
            <strong>Status:</strong> ${p.status} <br>
            <strong>Stock:</strong> ${p.stock} <br>
            <strong>Categoría:</strong> ${p.category} <br>
            <strong>Thumbnails:</strong> ${Array.isArray(p.thumbnails) ? p.thumbnails.join(', ') : p.thumbnails} <br>
            <button data-id="${p.id}">Eliminar</button>
            <hr>
        `;
        productList.appendChild(li);
    });

    document.querySelectorAll('button[data-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });
        });
    });
});
