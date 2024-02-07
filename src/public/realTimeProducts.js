const socket = io()

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById('logoutButton').addEventListener('click', cerrarSesion);
    function cerrarSesion() {
        localStorage.removeItem("token");
        window.location.href = '/';
    }
    
    // Obtener referencia al formulario y al campo de ID
    const productSelect = document.getElementById("productSelect");
    

    //referencia atributos prod
    const prodForm = document.getElementById("prod-form");
    const idInput = document.getElementById("productId");
    const nameInput = document.getElementById("name");
    const descInput = document.getElementById("desc");
    const priceInput = document.getElementById("price");
    const stockInput = document.getElementById("stock");
    const catInput = document.getElementById("cat");
    const operationSelect = document.getElementById("operationSelect");
    const ownInput = document.getElementById("owner");

    // Ocultar el campo de ID, seleccion, llenar formulario por defecto
    idInput.style.display = "none";
    
    productSelect.style.display = "none";

    operationSelect.addEventListener("change", function(){
        //limpiar inputs
        nameInput.value = ''
        descInput.value = ''
        priceInput.value = ''
        stockInput.value = ''
        catInput.value = ''
        ownInput.value = ''
    })
    // Manejar cambios en las opciones de operación
    prodForm.addEventListener("change", function (event) {
        const selectedOperation = document.querySelector('input[name="operation"]:checked').value;

        // Mostrar u ocultar el campo de ID según la operación seleccionada
        idInput.style.display = (selectedOperation === "edit") ? "block" : "none";
        productSelect.style.display = (selectedOperation === "edit") ? "block" : "none";
        
        nameInput.style.display = (selectedOperation === "edit") ? "none" : "block";

        // Limpiar el valor del campo de ID si se selecciona "Agregar producto"
        if (selectedOperation === "add") {
            idInput.value = '';
        }

        // Habilitar o deshabilitar el select y el botón según la operación seleccionada
        productSelect.disabled = (selectedOperation === "edit") ? false : true;
        
    });

    // Manejar clic en el botón "Llenar Formulario"
    
    productSelect.addEventListener("change", function () {
        const selectedProductId = productSelect.value;

        //su se vuelve a "Selecciona un producto", no se indefina
        if (selectedProductId=="-") {
            nameInput.value = "";
            descInput.value = "";
            priceInput.value = "";
            stockInput.value = "";
            catInput.value = "";
            ownInput.value = "";
            idInput.value = "";
            return
        }
        
        // llamar a encontrar el producto seleccionado en la lista de productos
        socket.emit("dataProd", selectedProductId);
        socket.on("foundProd", (productData) => {
            

            // const selectedProduct = products.find(product => product._id === selectedProductId);
    
                if (productData) {
                    
                    // Autocompletar los campos del formulario con la información del producto seleccionado
                    nameInput.value = productData.name;
                    descInput.value = productData.description;
                    priceInput.value = productData.price;
                    stockInput.value = productData.stock;
                    catInput.value = productData.category;
                    ownInput.value = productData.owner;
                    idInput.value = productData._id;
                }
        });
    });

    // Manejar envío del formulario
    prodForm.addEventListener("submit", function (e) {
        e.preventDefault();
    
        const selectedOperation = document.querySelector('input[name="operation"]:checked').value;
        console.log(selectedOperation)
        // Obtener valores del formulario según la operación seleccionada
        const id = (selectedOperation === "edit") ? idInput.value : '';
        const newProduct = {
            name: nameInput.value,
            description: descInput.value,
            price: priceInput.value,
            owner: ownInput.value,
            stock: stockInput.value,
            category: catInput.value,
            availability: document.getElementById("available").value
        };
    
        // Emitir evento al servidor para realizar la operación correspondiente
        if (selectedOperation === "add") {
            
            fetch('/api/products/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProduct)
                })
                .then(response => response.json())
                .then(data => {
                  // Manejar los datos de respuesta

                  socket.emit("addedProduct")
                
                })
                .catch(error => {
                  // Manejar errores
                  console.error('Se produjo un error:', error);
                });             
        
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
            }).then( async (result) => {
                if (result.isConfirmed) {
                    await fetch(`/api/products/${id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newProduct),
                      })
                        .then(response => response.json())
                        .then(data => {
                          socket.emit("editedProduct")
                          
                        })
                        .catch(error => {
                          console.error('Error al actualizar el producto:', error);
                        });
                }
            });
        }
    
        // Limpiar el formulario después de la operación
        // prodForm.reset();
    });

    document.querySelectorAll(".eliminarBtn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const productId = this.closest("li").getAttribute("data-id");
            const owner = this.closest("li").getAttribute("data-owner");
            const email = document.getElementById("correoLogin").value;
            const productName = this.closest("li").getAttribute("data-name");

            const deleteData = {
                owner,
                productName
            }
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
                    fetch(`/api/products/${productId}`, {
                        method: 'DELETE',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(deleteData),
                      })
                        .then(response => response.json())
                        .then(data => {
                          socket.emit("deletedProduct")
                          
                        })
                        .catch(error => {
                          console.error('Error al eliminar el producto:', error);
                        });
                }
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

    socket.on("errorUserPremium", (data) => {
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
});



