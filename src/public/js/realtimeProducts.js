const socket = io();

function renderProducts(products) {
    const list = document.querySelector(".product-list");
    list.innerHTML = '';
    products.forEach((p) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="product-item">
                <span>${p.title} - $${p.price}</span>
                <button class="delete-btn" data-id="${p.id}">Eliminar</button>
            </div>
        `;
        list.appendChild(li);
    });
}

document.querySelector(".product-list").addEventListener("click", e => {
    if (e.target.classList.contains("delete-btn")) {
        const id = e.target.getAttribute("data-id");
        socket.emit("delete-product", Number(id));
    }
});

document.querySelector(".add-product-form").addEventListener('submit', e => {
    e.preventDefault();

    const form = e.target;
    const productData = {
        title: form.title.value,
        description: form.description.value,
        code: form.code.value,
        price: Number(form.price.value),
        status: form.status.checked,
        stock: Number(form.stock.value),
        category: form.category.value,
        thumbnails: form.thumbnails.value
            .split(",")
            .map(url => url.trim())
            .filter(url => url)
    };

    if (!productData.title || !productData.description || !productData.code || !productData.price || !productData.stock || !productData.category) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    socket.emit('new-product', productData);
    form.reset();
});

socket.on('update-products', products => {
    renderProducts(products);
});
