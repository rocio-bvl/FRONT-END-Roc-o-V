// Se captura el formulario
const form = document.getElementById("formulario");
const mensaje = document.getElementById("mensaje");

// Detecta cuando el usuario hace submit
form.addEventListener("submit", async function (e) {
    e.preventDefault();
console.log("Hola")
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    // Validación
    if (correo === "" || password === "") {
        mensaje.textContent = "Todos los campos son obligatorios";
        return;
    }
    console.log("Hola2222",correo)

    if (!esEmailValido(correo)) {
        mensaje.textContent = "El formato del correo es incorrecto.";
        return;
    }

    // Llama al fetch()
    login(correo, password);
});

function esEmailValido(correo) {let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(correo);}

// Fetch
async function login(correo, password) {

    try {
        const respuesta = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: correo,
                password
            })
        });

        const data = await respuesta.json();
    console.log("Hola2222",respuesta.ok,respuesta)

        if (respuesta.ok) {
            mensaje.textContent = "Login exitoso";


            
        } else {
            mensaje.textContent =  "hola" //data.error;
        }

    } catch (error) {
        mensaje.textContent = "Error de conexión";
    }
}