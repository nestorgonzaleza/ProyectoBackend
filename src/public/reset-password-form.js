const socket = io()

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const newPassword = document.querySelector("#pwd").value //** */
    const newPasswordVerif = document.querySelector("#pwd2").value //** */
    const email = document.getElementById("emailPlaceholder").textContent;
    if(newPassword != newPasswordVerif)
    {
        socket.emit("notMatchPass");
    }
    else
    {
        socket.emit("validActualPass", {newPassword, newPasswordVerif, email});
    }
    
})
socket.on("warning", (data) => {
    Swal.fire({
        icon: 'warning',
        title: data,
        confirmButtonText: 'Aceptar', 
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload(); // Recarga la página cuando se hace clic en Aceptar
        }
    });
});

socket.on("samePass", (data) => {
    Swal.fire({
        icon: 'warning',
        title: data,
        confirmButtonText: 'Aceptar', // Cambia el texto del botón Aceptar
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
    });
});
socket.on("passChange", (data) => {
    Swal.fire({
        icon: 'success',
        title: data,
        confirmButtonText: 'Aceptar', // Cambia el texto del botón Aceptar
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = `/`;
        }
    });
});
socket.on("errorPassChange", (data) => {
    Swal.fire({
        icon: 'error',
        title: data,
        confirmButtonText: 'Aceptar', // Cambia el texto del botón Aceptar
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = `/`;
        }
    });
});






























//document.getElementById('restablecerContraseñaForm').addEventListener('submit', function (event) {
    //     event.preventDefault();
    
    //     const newPassword = document.getElementById('newPassword').value;
    //     const confirmPassword = document.getElementById('confirmPassword').value;
    //     console.log(newPassword)
    //     console.log(confirmPassword)
    //     // se valida si la nueva contraseña coincide con el segundo ingreso de contraseña
    //     if (newPassword !== confirmPassword) {
    //         alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
    //         return;
    //     }
    
    //     // Obtener el token de la URL
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const token = urlParams.get('token');
    
    //     // Realizar la solicitud POST al servidor
    //     fetch(`/reset-password/${token}`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ newPassword }),
    //     })
    //     .then(response => response.json())
    //     .then(
    //         console.log("Información de restablecimiento de contraseña enviada")
    //     )
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    // });