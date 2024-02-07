const socket = io()

document.addEventListener("DOMContentLoaded", function () {

    // const botonCarrito = document.getElementById("btnCarrito")

    // botonCarrito.addEventListener("click", goChart);
    //     function goChart() {
    //         console.log("Botón Carrito clickeado");
    //         const email = document.getElementById("emailUsuario").textContent;
    //         socket.emit("carrousuario", email)
    //         socket.on("solicitudCarro", async ({cartId, userMail})=>{
    //             const data = { cartId, userMail};
    //             await fetch('/api/carts/mycart/', {
    //                 method: 'POST',
    //                 headers: {
    //                   'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify(data)
    //               })
    //               .then(response => response.json())
    //               .then(data => {
    //                 console.log('Respuesta del servidor:', data);
    //               })
    //               .catch(error => {
    //                 console.error('Error al realizar la solicitud:', error);
    //               });
    //         });
    //     }

    document.getElementById('email-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const email = emailInput.value;
        emailInput.value = '';

        const comInput = document.getElementById('com');
        const comment = comInput.value;
        comInput.value = '';
        console.log(email)
        console.log(comment)

        socket.emit("newEmail",{email:email,comment:comment});

        }
    )

    document.querySelectorAll(".agregarAlCarritoBtn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const productId = this.closest("li").getAttribute("data-id");
            const owner = this.closest("li").getAttribute("data-owner");
            const email = document.getElementById("emailUsuario").textContent;
            const productName = this.closest("li").getAttribute("data-name");

            Swal.fire({
                title: "¿Estás segur@ de añadir el producto a tu carrito?",
                // text: "No podrás revertir la eliminación del producto",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, deseo agregarlo!",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    socket.emit("addToChart", {email , productId, owner})
                }
            });
        });
    });

    document.querySelectorAll(".agregarAlCarritoBtn").forEach(function (btn) {

    });

    socket.on("success", (data) => {
        Swal.fire({
            icon: 'success',
            title: data,
            text: `Ahora puedes seguir disfrutando de nuestros productos`,
            confirmButtonText: 'Aceptar',
        }).then((result) => {
            if (result.isConfirmed) {
                location.reload(); // Recarga la página cuando se hace clic en Aceptar
            }
        });
    });

    socket.on("autoCompra", (data) => {
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