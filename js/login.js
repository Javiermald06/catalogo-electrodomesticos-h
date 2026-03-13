function validarLogin(event) {
      event.preventDefault(); // Evita que la página se recargue
      
      const user = document.getElementById('admin-user').value;
      const pass = document.getElementById('admin-pass').value;

      // Simulador básico para el prototipo (Luego esto lo hará el backend)
      if (user === 'admin' && pass === '123456') {
        window.location.href = 'admin.html'; // Te enviará al dashboard
      } else {
        alert('❌ Credenciales incorrectas. Intente nuevamente.');
      }
    }