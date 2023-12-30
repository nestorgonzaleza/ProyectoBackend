const socket = io()

document.getElementById('prod-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const idInput = document.getElementById('productId');
    const id = idInput.value;
    idInput.value = '';

    const emailInput = document.getElementById('correoLogin');
    const email = emailInput.value;

    const descInput = document.getElementById('desc');
    const description = descInput.value;
    descInput.value = '';

    // const imgInput = document.getElementById('img');
    // const image = imgInput.value;
    // imgInput.value = '';

    const priceInput = document.getElementById('price');
    const price = priceInput.value;
    priceInput.value = '';

    const stockInput = document.getElementById('stock');
    const stock = stockInput.value;
    stockInput.value = '';

    const catInput = document.getElementById('cat');
    const category = catInput.value;
    catInput.value = '';

    const availableInput = document.getElementById('available');
    const available = availableInput.value;

    const ownerInput = document.getElementById('owner');
    const owner = ownerInput.value;
    ownerInput.value = '';


    
    const newProduct = {
        description: description,
        // image:image,
        price: price,
        stock: stock,
        category: category,
        availability: available,
        owner: owner,
    }
    
    if (id === '') {

        // Si el ID está vacío, es un nuevo producto (crear)
        socket.emit("newProd", newProduct);

    } else {
            
        // Si el ID tiene un valor, es un producto existente (actualizar)
        socket.emit("updProd", { id: id, newProduct });

    }

});

document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll(".eliminarBtn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const productId = this.closest("li").getAttribute("data-id");
        const owner = this.closest("li").getAttribute("data-owner");
        const email = document.getElementById("correoLogin").value;
  
        // Emitir evento al servidor para eliminar el producto
        socket.emit("delProdPremium", { id: productId, owner: owner, email: email });
      });
    });
  });

socket.on("success", (data) => {
    Swal.fire({
        icon: 'success',
        title: data,
        text: `A continuación verás la lista actualizada`,
        confirmButtonText: 'Aceptar', // Cambia el texto del botón Aceptar
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload(); // Recarga la página cuando se hace clic en Aceptar
        }
    });
});

socket.on("errorDelPremium", (data) => {
    Swal.fire({
        icon: 'error',
        title: data,
        confirmButtonText: 'Aceptar', // Cambia el texto del botón Aceptar
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload(); // Recarga la página cuando se hace clic en Aceptar
        }
    });
});