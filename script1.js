
window.addEventListener("load", function () {

    const logoutBtn = document.getElementById("logout");

    console.log("Botón encontrado:", logoutBtn);

    if (logoutBtn) {
        logoutBtn.onclick = function () {
            console.log("CLICK");
            window.location.href = "index.html";
        };

    } else {
        console.log("No hay botón logout en esta página");
    }

});



//-----------------------REGISTER-----------------------


const registerForm = document.getElementById("registerForm");

console.log("FORM:", registerForm);

//                    evita que se ejecute en otras páginas
if (registerForm && window.location.pathname.includes("register.html")) {

    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        console.log("Formulario detectado");

        // obtener datos del formulario
        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password.length < 8) {
            alert("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        if (nombre === "" || correo === "" || password === "" || confirmPassword == "") {
            alert("Todos los campos son obligatorios");
            return;
        }

        try {
            const respuesta = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name: nombre,
                    email: correo,
                    password: password,
                    role: "user"
                })
            });

            const data = await respuesta.json();

            console.log("RESPUESTA REGISTER:", data);

            if (respuesta.ok && data.data) {
                alert("Usuario registrado correctamente");
                window.location.href = "login.html";
            } else {
                alert("Error al registrar");
            }

        } catch (error) {
            console.error("ERROR REGISTER:",error);
            alert("Error de conexión");
        }
    });
}


//---------------------USUARIO------------------------


if (window.location.pathname.includes("perfil.html")) {

    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/api/auth/profile", {
        headers: {
            "Authorization": 'Bearer ${token}'
        }
    })
    .then(res => res.json())
    .then(data => {

        const user = data.data;

        document.getElementById("nombreUsuario").textContent = user.full_name;
        document.getElementById("correoUsuario").textContent = user.email;

    })
    .catch(error => console.error("Error perfil:", error));
}


const btnEditar = document.getElementById("btnEditar");
const btnGuardar = document.getElementById("btnGuardar");

if (btnEditar) {

    btnEditar.addEventListener("click", () => {

        document.getElementById("inputNombre").hidden = false;
        document.getElementById("inputCorreo").hidden = false;
        btnGuardar.hidden = false;

        document.getElementById("inputNombre").value =
            document.getElementById("nombreUsuario").textContent;

        document.getElementById("inputCorreo").value =
            document.getElementById("correoUsuario").textContent;
    });
}


if (btnGuardar) {

    btnGuardar.addEventListener("click", async () => {

        const token = localStorage.getItem("token");

        const nombre = document.getElementById("inputNombre").value;
        const correo = document.getElementById("inputCorreo").value;

        try {

            const respuesta = await fetch("http://localhost:3000/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    full_name: nombre,
                    email: correo
                })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {

                alert("Perfil actualizado ✅");

                document.getElementById("nombreUsuario").textContent = nombre;
                document.getElementById("correoUsuario").textContent = correo;

            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(error);
        }
    });
}