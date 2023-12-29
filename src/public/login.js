document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.querySelector("#email").value
    const password = document.querySelector("#password").value

    const response = await fetch("/login", {
        
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
        
      });
     
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); 
      
        if (data.token && data.user.role === 'admin') 
        {
          //Perfil admin
          console.log('Redirigiendo a /admin');
          window.location.href = '/admin';
        } else if (data.token && data.user.role === 'usuario') {
          //Perfil usuario
          console.log('Redirigiendo a /current');
          window.location.href = '/current';
        }
        else if (data.token && data.user.role === 'premium') {
          //Acceso Usuario
          console.log('Redirigiendo a /current-super');
          window.location.href = `/current-super?token=${encodeURIComponent(data.token)}`;
        }
      } else {
        console.error("Error en el inicio de sesión");
      } 
})

document.addEventListener("DOMContentLoaded", function () {
  const forgotPasswordButton = document.getElementById("forgotPasswordButton");
  const goRecover = document.getElementById("goRecover");
  forgotPasswordButton.addEventListener("click", async function (event) {
      event.preventDefault();
      const email = document.getElementById("email").value;

      const responsePass = await fetch("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (responsePass.ok) {
        const result = await responsePass.text();
        goRecover.textContent = result; 
      } else {
        const result = await responsePass.text();
        goRecover.textContent = result; 
      } 

  });
});