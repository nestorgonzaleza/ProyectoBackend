const socket = io()

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById('logoutButton').addEventListener('click', cerrarSesion);
    function cerrarSesion() {
        localStorage.removeItem("token");
        window.location.href = '/';
    }
    
    // Obtener referencia al formulario y al campo de ID
    const userSelect = document.getElementById("userSelect");
    actualRole.innerHTML = "Seleccione un usuario"

    //referencia atributos doc
    const userForm = document.getElementById("user-form");

    //botones eliminar usuarios inactivos
    const deleteInactiveUsers2Days= document.getElementById("deleteInactiveUsers2Days");
    const deleteInactiveUsers5Min = document.getElementById("deleteInactiveUsers5Min");

    deleteInactiveUsers2Days.addEventListener("click", function(){
        Swal.fire({
            title: `¿Estás segur@ de eliminar cuentas?`,
            text: `Se eliminarán los usuarios inactivos hace 2 días`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, deseo eliminarlas",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch("/api/users/", {
                    method: "DELETE",
                  })
                    .then((response) => response.json())
                    .then((data) => {
                        socket.emit("reloadUsers")
                    })
                    .catch((error) => {
                        console.error("Error al eliminar usuarios inactivos:", error);
                    });
            }
        });
    })

    deleteInactiveUsers5Min.addEventListener("click", function () {
        Swal.fire({
            title: `¿Estás segur@ de eliminar cuentas?`,
            text: `Se eliminarán los usuarios inactivos hace 5 minutos`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, deseo eliminarlas",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                response = await fetch("/api/users/5min", {
                    method: "DELETE",
                })
                    .then((response) => response.json())
                    .then((data) => {
                        socket.emit("reloadUsers")
                    })
                    .catch((error) => {
                        console.error("Error al eliminar usuarios inactivos:", error);
                    });
            }
        });
    });



    // Manejar cambio en el formulario
    
    userSelect.addEventListener("change", function () {
        const selectedUser = userSelect.value;

        // su se vuelve a "Selecciona un producto", no se indefina
        if (!selectedUser) {
            actualRole.innerHTML = "Seleccione un usuario";
            
        }
        
        // llamar a encontrar el producto seleccionado en la lista de productos
        socket.emit("dataUser", selectedUser);
        socket.on("foundUser", (userData) => {
            

            // const selectedProduct = products.find(product => product._id === selectedProductId);
    
                if (userData) {
                    
                    // Autocompletar los campos actual de rol
                    actualRole.innerHTML = userData.role;
                    
                }
        });
    });

    // Manejar envío del formulario
    userForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const mailUser = userSelect.value;
        const newRole = document.getElementById("newRole").value;
        
        
        if (mailUser){
            Swal.fire({
                title: `¿Estás segur@ de actualizar el rol del usuario ${mailUser}?`,
                text: `El Rol nuevo reemplazará al Rol actual`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, deseo editar",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    socket.emit("updUser", { mailUser, newRole });
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: "Debe seleccionar un usuario",
                confirmButtonText: 'Aceptar',
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload(); // Recarga la página cuando se hace clic en Aceptar
                }
            });
        }    
        

        // Limpiar el formulario después de la operación
        userForm.reset();
    });

    document.querySelectorAll(".eliminarUsuario").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const emailUser = this.closest("li").getAttribute("data-email");
            const roleUser = this.closest("li").getAttribute("data-role");


            
            if (roleUser == "admin"){
                Swal.fire({
                    icon: 'error',
                    title: "No es posible eliminar cuentas con rol de administrador",
                    confirmButtonText: 'Aceptar',
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload(); // Recarga la página cuando se hace clic en Aceptar
                    }
                });
            } else {
                Swal.fire({
                    title: "¿Estás segur@ de eliminar el usuario?",
                    text: "No podrás revertir la eliminación de la cuenta",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Sí, deseo eliminarlo",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        socket.emit("delUser",  emailUser );
                    }
                });
            }

            
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

