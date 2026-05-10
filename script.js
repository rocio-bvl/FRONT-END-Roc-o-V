//--------------------LOGIN---------------------------

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
    await login(correo, password);
});

function esEmailValido(correo) {let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(correo);}

// Fetch
async function login(correo, password) {

    try {
        console.log("Enviando datos...");
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

        console.log("RESPUESTA:",data);
        console.log("respuesta.ok:", respuesta.ok);
        console.log("data:", data);

        if (respuesta.ok && data.data && data.data.user) {
            mensaje.textContent = "Login exitoso";

            const rol = data.data.user.role;
            console.log("ROL:",data.data.user.role);

            if (rol === "admin") {
                window.location.href = "admin.html";
            } 
            else if (rol === "coach") {
                window.location.href = "coach.html";
            } 
            else if (rol == "user"){
                window.location.href = "usuario.html";
            }
        } else {
            mensaje.textContent = "Credenciales incorrectas";
        }

    } catch (error) {
        console.error("ERROR REAL:", error);
        mensaje.textContent = "Error de conexión";
    }
}



//----------------------- -----------------------


