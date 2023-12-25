document.getElementById('restablecerContraseñaForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    console.log(newPassword)
    console.log(confirmPassword)
    // se valida si la nueva contraseña coincide con el segundo ingreso de contraseña
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
        return;
    }

    // Obtener el token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Realizar la solicitud POST al servidor
    fetch(`/reset-password/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
    })
    .then(response => response.json())
    .then(
        console.log("Información de restablecimiento de contraseña enviada")
    )
    .catch(error => {
        console.error('Error:', error);
    });
});