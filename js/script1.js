// ********


//==================================================
//------------------ DASHBOARDS --------------------
//==================================================

window.addEventListener("load", function () {
    const logoutBtn = document.getElementById("logout");
    console.log("Botón encontrado:", logoutBtn);

    if (logoutBtn) {
        logoutBtn.onclick = function () {
            console.log("CLICK");
            window.location.href = "index.html";
        };
    } 
    else {
        console.log("No hay botón logout en esta página");}
});


window.addEventListener("load", function () {
    const editarBtn = document.getElementById("editar");
    console.log("Botón encontrado:", editarBtn);

    if (editarBtn) {
        editarBtn.onclick = function () {
            console.log("CLICK");
            window.location.href = "perfil.html";
        };
    } 
    else {
        console.log("No hay botón editar en esta página");}
});


if (window.location.pathname.includes("usuario.html")) {
    cargarPerfilDashboard();
}

async function cargarPerfilDashboard() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/auth/me", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        const data = await res.json();
        const user = data.data;

        document.querySelector(".nombre").textContent = user.full_name;
        document.querySelector(".correo").textContent = user.email;
    } catch (error) {
        console.error("Error dashboard perfil:", error);
    }
}

if (window.location.pathname.includes("coach.html")) {
    cargarCoach();
}

async function cargarCoach() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/auth/me", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();
        const user = data.data;
        // mostrar nombre usuario
        document.getElementById("nombreCoach").textContent = user.full_name;
    } catch (error) {
        console.error("Error cargando coach:", error);
    }
}




//=======================================================
//---------------------- REGISTER -----------------------
//=======================================================

const registerForm = document.getElementById("registerForm");
console.log("FORM:", registerForm);

//                  evita que se ejecute en otras páginas
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
            } 
            else {
                alert("Error al registrar");
            }

        } catch (error) {
            console.error("ERROR REGISTER:",error);
            alert("Error de conexión");
        }
    });
}




//=====================================================
//--------------------- PERFIL ------------------------
//=====================================================

// detectar si está en perfil.html
if (window.location.pathname.includes("perfil.html")) {
    iniciarPerfil(); // ejecuta todo el módulo
}

// Función principal:
function iniciarPerfil() {
    cargarPerfil();        // 1. obtener datos del usuario desde el backend
    configurarEdicion();   // 2. editar perfil (activa el botón guardar cambios)
    configurarPassword();  // 3. cambiar contraseña
    configurarDashboard(); // 4. redirección dinámica (que el dashboard vaya al rol correcto)
    configurarCancelarPerfil(); // 5. reestablecer inputs al cancelar
} 


// 1. CARGAR PERFIL (GET /api/auth/me)
async function cargarPerfil() {
    try { // obtener token guardado en login
        const token = localStorage.getItem("token");
        // petición al backend
        const respuesta = await fetch("http://localhost:3000/api/auth/me", {
            headers: { // manda token al servidor
                "Authorization": "Bearer " + token
            }
        });

        const data = await respuesta.json();
        const user = data.data; // extrae el usuario
        // restricciones por rol
        const inputEmail = document.getElementById("inputEmail");
        // si es usuario normal
        if (user.role === "user") {
            inputEmail.disabled = true; // no puede editar email
        } else {
        inputEmail.disabled = false;
        }

        // mostrar datos en el perfil
        document.getElementById("nombreUsuario").textContent =
            capitalizar(user.full_name);
        document.getElementById("emailUsuario").textContent =
            user.email.toLowerCase();
        document.getElementById("fechaUsuario").textContent =
            formatearFecha(user.birth_date);
        document.getElementById("registroUsuario").textContent =
            formatearFecha(user.created_at);

        // mostrar rol como texto
        document.getElementById("rolTexto").textContent = user.role;

        // badge con color dinámico
        const badge = document.getElementById("rolUsuario");
        badge.textContent = user.role; // muestra user / coach / admin
        badge.className = "badge " + user.role;

        // cargar datos en inputs (para edición)
        document.getElementById("inputNombre").value = user.full_name;
        document.getElementById("inputEmail").value = user.email;
        document.getElementById("inputFecha").value = user.birth_date;

        // metadata (opcional. si hay, la muestra, sino, vacío)
        document.getElementById("inputMeta").textContent = 
        user.metadata || "Sin información";
    } catch (error) {
        console.error("Error cargando perfil:", error);
    }
}

// Funciones auxiliares (formato)
function formatearFecha(fecha) {
    if (!fecha) return "";
    const f = new Date(fecha); // convierte en objeto
    // formato dd/mm/yyyy 
    return f.toLocaleDateString("es-CL");
}

function capitalizar(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .replace(/\b\w/g, letra => letra.toUpperCase());
}


// 2. EDITAR PERFIL (PUT /api/auth/me)
function configurarEdicion() { // prepara el botón guardar
    const btnGuardar = document.getElementById("btnGuardar");
    btnGuardar?.addEventListener("click", guardarPerfil);
} // al hacer click, ejecuta guardarPerfil. ?. evita error si no existe

async function guardarPerfil() {
    const nombre = document.getElementById("inputNombre"); // obtiene nombre sin espacios extra
    const email = document.getElementById("inputEmail");
    const fecha = document.getElementById("inputFecha").value;

    const errorNombre = document.getElementById("errorNombre");
    const errorEmail = document.getElementById("errorEmail");

    const valorNombre = nombre.value.trim();
    const valorEmail = email.value.trim();

    // limpiar errores antes
    nombre.classList.remove("input-error");
    email.classList.remove("input-error");

    errorNombre.textContent = "";
    errorEmail.textContent = "";

    let valido = true; // variable para validar

    // validación visual
    if (valorNombre === "") {
        errorNombre.textContent = "El nombre es obligatorio";
        nombre.classList.add("input-error");
        valido = false;
    }

    if (valorEmail === "") {
        errorEmail.textContent = "El email es obligatorio";
        email.classList.add("input-error");
        valido = false;
    }
    else if (!valorEmail.includes("@")) {
        errorEmail.textContent = "Email inválido";
        email.classList.add("input-error");
        valido = false;
    }

    if (!valido) return; // si hay error detiene todo

    try {
        const token = localStorage.getItem("token");
        const respuesta = await fetch("http://localhost:3000/api/auth/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                full_name: valorNombre,
                email: inputEmail.disabled ? undefined : valorEmail,
                birth_date: fecha,
            }) // datos actualizados
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert("Perfil actualizado correctamente");
            // recargar datos en pantalla (nuevos)
            cargarPerfil();
        } 
        else {
            alert(data.message);
        }
    } 
    catch (error) {
        console.error(error);
    }
}


// 3. CAMBIAR CONTRASEÑA (PUT /api/auth/me/password)
function configurarPassword() {
    const btn = document.getElementById("btnPassword");
    btn?.addEventListener("click", cambiarPassword);}

async function cambiarPassword() {
    const actual = document.getElementById("passActual").value;
    const nueva = document.getElementById("passNueva").value;
    const confirmar = document.getElementById("passConfirmar").value;

    // validación mínima requerida
    if (nueva.length < 8) {
        alert("La contraseña debe tener al menos 8 caracteres");
        return;
    }
    // valida que coincidan
    if (nueva !== confirmar) {
        alert("Las contraseñas no coinciden");
        return;
    }
    // que no falte ningun campo por rellenar
    if (!actual || !nueva || !confirmar) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        console.log("ENVIANDO PASSWORD:", {
            current_password: actual,
            new_password: nueva,
            confirm_password: confirmar
        });
        const res = await fetch("http://localhost:3000/api/auth/me/password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                current_password: actual,
                new_password: nueva,
                confirm_password: confirmar
            })
        });

        const data = await res.json();

        console.log("RESPUESTA BACKEND:", data);

        if (res.ok) {
            alert("Contraseña actualizada de forma correcta");
        } 
        else {
            alert(data.message || "Error al cambiar contraseña");
        }
    } catch (error) {
        console.error("ERROR:", error);
    }
}


// 4. DASHBOARD DINÁMICO SEGÚN ROL
function configurarDashboard() {
    const link = document.getElementById("dashboardLink");

    if (!link) return;
    link.addEventListener("click", async function (e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/auth/me", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const data = await res.json();
            const rol = data.data.role;

            if (rol === "admin") {
                window.location.href = "admin.html";
            }
            else if (rol === "coach") {
                window.location.href = "coach.html";
            }
            else {
                window.location.href = "usuario.html";
            }
        } catch (error) {
            console.error("Error dashboard:", error);
        }
    });
}


// 5. REESTABLECER DATOS AL CANCELAR
function configurarCancelarPerfil() {
    const btn = document.getElementById("btnCancelarPerfil");
    btn?.addEventListener("click", () => {
        cancelarEdicionPerfil();
    });
}

function cancelarEdicionPerfil() {
    // volver a cargar datos originales desde backend
    cargarPerfil();
    // limpiar errores visuales
    const nombre = document.getElementById("inputNombre");
    const email = document.getElementById("inputEmail");

    const errorNombre = document.getElementById("errorNombre");
    const errorEmail = document.getElementById("errorEmail");

    errorNombre.textContent = "";
    errorEmail.textContent = "";

    nombre.classList.remove("input-error");
    email.classList.remove("input-error");
}




//=====================================================
//---------------------- CRUD -------------------------
//=====================================================

// confirmar página
if (window.location.pathname.includes("gestion-usuarios.html")) {
    iniciarUsuarios();
}

// inicio
function iniciarUsuarios() {
    cargarUsuarios();
    configurarCrear();
    configurarCancelar();
}

let idEditando = null; // al editar tiene ID, al crear es null


// 1. OBTENER USUARIOS
// GET /api/users
async function cargarUsuarios() {
    try { // obtiene el token del login
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/users", {
            headers: { // envía el token al backend
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json(); // convierte la respuesta en JSON
        const lista = data.data; // extrae los usuarios
        const tabla = document.getElementById("tablaUsuarios"); // busca el <tbody> donde aparecerán los usuarios
        tabla.innerHTML = ""; // limpia la tabla antes de llenarla denuevo

        // recorre todos los usuarios 1 por 1
        lista.forEach(user => {
            const fila = document.createElement("tr");
            // inserta contendio HTML dinámicamente
            fila.innerHTML = ` 
                <td>${user.id}</td>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role}">${user.role}</span></td>
                <td>${formatearFecha(user.created_at)}</td>
                <td class="acciones">
                    <button class="editar" onclick="editarUsuario(event,${user.id})">✏️</button>
                    <button class="eliminar" onclick="eliminarUsuario(${user.id})">🗑️</button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    } catch (error) {
        console.error("Error usuarios:", error);
    }
}

// formato fecha
function formatearFecha(fecha) { // recibe una fecha del backend
    const f = new Date(fecha); // convierte en objeto fecha
    return f.toLocaleDateString("es-CL"); // transforma a formato chileno
}


// 2. CREAR USUARIO
// POST /api/users
function configurarCrear() { // prepara el botón guardar
    const btnGuardar = document.querySelector(".guardar");
    btnGuardar?.addEventListener("click", crearUsuario);
}

async function crearUsuario() { // función que envía los datos al backend
    // obtienen los valores de los inputs:
    const inputNombre = document.getElementById("nuevoNombre");
    const inputEmail = document.getElementById("nuevoEmail");
    const inputPassword = document.getElementById("nuevoPassword");
    const inputConfirm = document.getElementById("confirmPassword");

    const nombre = inputNombre.value.trim();
    const email = inputEmail.value.trim();
    const rol = document.getElementById("nuevoRol").value;
    const password = inputPassword.value;
    const confirm = inputConfirm.value;

    // obtener mensajes de error
    const errorNombre = inputNombre.nextElementSibling;
    const errorEmail = inputEmail.nextElementSibling;
    const errorPassword = inputPassword.nextElementSibling;
    const errorConfirm = inputConfirm.nextElementSibling;

    // limpiar errores antes
    [inputNombre, inputEmail, inputPassword, inputConfirm].forEach(i => i.classList.remove("input-error"));
    [errorNombre, errorEmail, errorPassword, errorConfirm].forEach(e => e.textContent = "");

    let valido = true;

    // validaciones
    if (nombre === "") {
        errorNombre.textContent = "El nombre es obligatorio";
        inputNombre.classList.add("input-error");
        valido = false;
    }

    if (email === "") {
        errorEmail.textContent = "El email es obligatorio";
        inputEmail.classList.add("input-error");
        valido = false;
    }
    else if (!email.includes("@")) {
        errorEmail.textContent = "Email inválido";
        inputEmail.classList.add("input-error");
        valido = false;
    }

    if (password === "") {
        errorPassword.textContent = "La contraseña es obligatoria";
        inputPassword.classList.add("input-error");
        valido = false;
    }
    else if (password.length < 8) {
        errorPassword.textContent = "Contraseña mínima 8 caracteres";
        inputPassword.classList.add("input-error");
        valido = false;
    }

    if (confirm === "") {
        errorConfirm.textContent = "Debe confirmar la contraseña";
        inputConfirm.classList.add("input-error");
        valido = false;
    }
    else if (password !== confirm) {
        errorConfirm.textContent = "Las contraseñas no coinciden";
        inputConfirm.classList.add("input-error");
        valido = false;
    }

    // detener si hay errores
    if (!valido) return;

    try {
        const token = localStorage.getItem("token");

        let url = "http://localhost:3000/api/users";
        let metodo = "POST";

        if (idEditando) {
            url = `http://localhost:3000/api/users/${idEditando}`;
            metodo = "PUT";
        }
        const res = await fetch(url, {
            method: metodo, // método crear o editar dependiendo de acción
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }, // datos enviados al backend:
            body: JSON.stringify({
                full_name: nombre,
                email: email,
                password: password,
                role: rol
            })
        });

        const data = await res.json(); // respuesta del backend

        if (res.ok) { // si la respuesta es correcta
            alert(idEditando ? "Usuario editado" : "Usuario creado");
            cargarUsuarios(); // actualiza tabla automáticamente
            idEditando = null;

            document.getElementById("nuevoNombre").value = "";
            document.getElementById("nuevoEmail").value = "";
            document.getElementById("nuevoPassword").value = "";
            document.getElementById("confirmPassword").value = "";
            document.getElementById("btnGuardar").textContent = "Guardar";
        } 
        else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
    }
}


// 3. ELIMINAR USUARIO
// DELETE /api/users/:id
async function eliminarUsuario(id) { // recibe ID del usuario
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return; // confirmación antes de borrar
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/api/users/${id}`, {
            method: "DELETE", // método eliminar
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (res.ok) { // si se eliminó correctamente
            alert("Usuario eliminado");
            cargarUsuarios(); // actualiza tabla
        }
    } catch (error) {
        console.error(error);
    }
}


//4. EDITAR USUARIO
function editarUsuario(event, id) {
    idEditando = id; // guardar ID del usuario a editar

    const fila = event.target.closest("tr"); // obtiene fila en la que se hizo click
    const nombre = fila.children[1].textContent; // columna
    const email = fila.children[2].textContent;
    const rol = fila.children[3].textContent;

    // llenar formulario con los datos
    document.getElementById("nuevoNombre").value = nombre;
    document.getElementById("nuevoEmail").value = email;
    document.getElementById("nuevoRol").value = rol;

    // cambia texto del botón
document.getElementById("btnGuardar").textContent = "Guardar cambios";
}

// botón cancelar
function limpiarFormulario() {
    const nombre = document.getElementById("nuevoNombre");
    const email = document.getElementById("nuevoEmail");
    const password = document.getElementById("nuevoPassword");
    const confirm = document.getElementById("confirmPassword");

    // limpiar inputs
    nombre.value = "";
    email.value = "";
    password.value = "";
    confirm.value = "";

    // limpiar errores
    const errores = document.querySelectorAll(".formulario").querySelectorAll(".error");
    errores.forEach(e => e.textContent = "");

    // quitar borde rojo
    [nombre, email, password, confirm].forEach(i =>
        i.classList.remove("input-error")
    );

    // volver a modo crear
    idEditando = null;

    // restaurar texto botón
    document.getElementById("btnGuardar").textContent = "Guardar";
}

function configurarCancelar() {
    const btnCancelar = document.getElementById("btnCancelar");
    if (!btnCancelar) return;
    btnCancelar.addEventListener("click", limpiarFormulario);
}
