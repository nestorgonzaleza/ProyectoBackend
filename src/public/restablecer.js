document.getElementById('restablecerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;

    // POST con el mail para iniciar restablecimiento de contraseña
    fetch('/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(
        console.log("Mail enviado al servidor")
    )
    .catch(error => {
        console.error('Error:', error);
    });
});