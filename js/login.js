async function validarLogin(event) {
    event.preventDefault(); 
    
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    // Preparamos los datos para enviarlos por POST a PHP
    const formData = new FormData();
    formData.append('usuario', user);
    formData.append('password', pass);

    try {
        // Apuntamos a tu archivo de autenticación
        const response = await fetch('includes/auth/procesar_login.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            // Si el hash y usuario coinciden en MySQL, PHP manda el redirect
            window.location.href = result.redirect; 
        } else {
            // Mensaje de error desde PHP (usuario o contraseña incorrectos)
            alert('❌ ' + result.msg);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert('❌ Error al conectar con el servidor.');
    }
}