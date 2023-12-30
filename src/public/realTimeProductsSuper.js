const socket = io()

document.addEventListener("DOMContentLoaded", function () {

    
    // Obtener referencia al formulario y al campo de ID
    const prodForm = document.getElementById("prod-form");
    const idInput = document.getElementById("productId");

    // Manejar cambios en las opciones de operación
    prodForm.addEventListener("change", function (event) {
        const selectedOperation = document.querySelector('input[name="operation"]:checked').value;

        // Mostrar u ocultar el campo de ID según la operación seleccionada
        idInput.style.display = (selectedOperation === "edit") ? "block" : "none";

        // Limpiar el valor del campo de ID si se selecciona "Agregar producto"
        if (selectedOperation === "add") {
            idInput.value = '';
        }
    });

    // Manejar envío del formulario
    prodForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectedOperation = document.querySelector('input[name="operation"]:checked').value;

        // Obtener valores del formulario según la operación seleccionada
        const id = (selectedOperation === "edit") ? idInput.value : '';
        const newProduct = {
            description: document.getElementById("desc").value,
            price: document.getElementById("price").value,
            // image: document.getElementById("img").value,
            owner: document.getElementById("owner").value,
            stock: document.getElementById("stock").value,
            category: document.getElementById("cat").value,
            availability: document.getElementById("available").value
        };

        // Emitir evento al servidor para realizar la operación correspondiente
        if (selectedOperation === "add") {
            socket.emit("newProd", newProduct);
        } else {
            Swal.fire({
                title: "¿Estás segur@ de editar el producto?",
                text: "Los valores del formulario reemplazarán los actuales",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, deseo editar",
                cancelButtonText: "Cancelar"
              }).then((result) => {
                if (result.isConfirmed) {
                    socket.emit("updProd", { id: id, newProduct });
                }
              });

            
        }

        // Limpiar el formulario después de la operación
        prodForm.reset();
    });

});



document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll(".eliminarBtn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const productId = this.closest("li").getAttribute("data-id");
        const owner = this.closest("li").getAttribute("data-owner");
        const email = document.getElementById("correoLogin").value;
        
        Swal.fire({
            title: "¿Estás segur@ de eliminar el producto?",
            text: "No podrás revertir la eliminación del producto",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, deseo eliminarlo",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
                socket.emit("delProdPremium", { id: productId, owner: owner, email: email });
            }
          });
        

      });
    });
  });

socket.on("success", (data) => {
    Swal.fire({
        icon: 'success',
        title: data,
        text: `A continuación verás la lista actualizada`,
        confirmButtonText: 'Aceptar', 
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
        confirmButtonText: 'Aceptar', 
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload(); // Recarga la página cuando se hace clic en Aceptar
        }
    });
});