import { registerUser } from '../services/userService.js';

const app = document.getElementById('app');

/**
 * Build a safe URL for fetching view fragments inside Vite (dev and build).
 * @param {string} name - The name of the view (without extension).
 * @returns {URL} The resolved URL for the view HTML file.
 */
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

/**
 * Load an HTML fragment by view name and initialize its corresponding logic.
 * @async
 * @param {string} name - The view name to load (e.g., "home", "board").
 * @throws {Error} If the view cannot be fetched.
 */
async function loadView(name) {
  const res = await fetch(viewURL(name));
  if (!res.ok) throw new Error(`Failed to load view: ${name}`);
  const html = await res.text();
  app.innerHTML = html;

  if (name === 'home') initHome();
  if (name === 'board') initBoard();
  if (name === 'register') initRegister()
  if (name === 'forgot') initForgot();
}

/**
 * Initialize the hash-based router.
 * Attaches an event listener for URL changes and triggers the first render.
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // first render
}

/**
 * Handle the current route based on the location hash.
 * Fallback to 'home' if the route is unknown.
 */
function handleRoute() {
  const path = (location.hash.startsWith('#/') ? location.hash.slice(2) : '') || 'home';
  const known = ['home', 'board', 'register', 'forgot'];
  const route = known.includes(path) ? path : 'home';

  loadView(route).catch(err => {
    console.error(err);
    app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
  });
}

/* ---- View-specific logic ---- */

/**
 * Initialize the "home" view.
 * Attaches a submit handler to the register form to navigate to the board.
 */
function initHome() {
  const form = document.getElementById('registerForm');
  const userInput = document.getElementById('username');
  const passInput = document.getElementById('password');
  const msg = document.getElementById('registerMsg');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const username = userInput?.value.trim();
    const password = passInput?.value.trim();

    if (!username || !password) {
      msg.textContent = 'Por favor completa usuario y contraseña.';
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const data = await registerUser({ username, password });
      msg.textContent = 'Registro exitoso';

      setTimeout(() => (location.hash = '#/board'), 400);
    } catch (err) {
      msg.textContent = `No se pudo registrar: ${err.message}`;
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

/**
 * Initialize the "board" view.
 * Sets up the todo form, input, and list with create/remove/toggle logic.
 */
function initBoard() {
  const form = document.getElementById('todoForm');
  const input = document.getElementById('newTodo');
  const list = document.getElementById('todoList');
  if (!form || !input || !list) return;

  // Add new todo item
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;

    const li = document.createElement('li');
    li.className = 'todo';
    li.innerHTML = `
      <label>
        <input type="checkbox" class="check">
        <span>${title}</span>
      </label>
      <button class="link remove" type="button">Eliminar</button>
    `;
    list.prepend(li);
    input.value = '';
  });

  // Handle remove and toggle completion
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.todo');
    if (!li) return;
    if (e.target.matches('.remove')) li.remove();
    if (e.target.matches('.check')) li.classList.toggle('completed', e.target.checked);
  });
}

function initRegister() {
  // Obtén los elementos del formulario y los campos
  const form = document.getElementById('registerForm');
  const userInput = document.getElementById('username');
  const lastnameInput = document.getElementById('lastname');
  const ageInput = document.getElementById('age');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const confirmPassInput = document.getElementById('confirmPassword');
  const msg = document.getElementById('registerMsg');

  // Verifica si el formulario existe
  if (!form) return;

  // Maneja el evento submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();  // Evita el comportamiento por defecto del formulario (que recargue la página)
    msg.textContent = ''; // Limpia cualquier mensaje previo

    // Obtén los valores de los campos
    const username = userInput?.value.trim();
    const lastname = lastnameInput?.value.trim();
    const age = ageInput?.value.trim();
    const email = emailInput?.value.trim();
    const password = passInput?.value.trim();
    const confirmPassword = confirmPassInput?.value.trim();

    // Validación de campos
    if (!username || !lastname || !age || !email || !password || !confirmPassword) {
      msg.textContent = 'Por favor completa todos los campos.';
      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    // Deshabilita el botón de envío para evitar múltiples envíos
    form.querySelector('button[type="submit"]').disabled = true;

    try {
      // Llama a la función de registro con los datos del formulario
      const data = await registerUser({ username, lastname, age, email, password });
      msg.textContent = 'Registro exitoso';  // Muestra un mensaje de éxito

      // Redirige a la vista "board" después de un corto retraso
      setTimeout(() => (location.hash = '#/board'), 400);
    } catch (err) {
      // Si ocurre un error en el registro, muestra el mensaje
      msg.textContent = `No se pudo registrar: ${err.message}`;
    } finally {
      // Vuelve a habilitar el botón de envío
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

function initForgot() {
  // Obtén los elementos del formulario y los campos
  const form = document.getElementById('recoverForm');
  const emailInput = document.getElementById('email');
  const msg = document.getElementById('message');

  // Verifica si el formulario existe
  if (!form) return;

  // Maneja el evento submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();  // Evita el comportamiento por defecto del formulario (recargar la página)
    msg.textContent = ''; // Limpia cualquier mensaje previo

    // Obtén el valor del campo de correo electrónico
    const email = emailInput?.value.trim();

    // Validación de correo
    if (!email) {
      msg.textContent = 'Por favor ingresa tu correo electrónico.';
      return;
    }

    // Deshabilita el botón de envío para evitar múltiples envíos
    form.querySelector('button[type="submit"]').disabled = true;

    try {
      // Simula el envío de enlace de recuperación
      // En este caso no estamos interactuando con un backend, solo simulamos el éxito
      const users = getUsers(); // Obtener usuarios registrados
      const user = users.find((u) => u.email === email);

      if (!user) {
        msg.textContent = 'El correo no está registrado.';
        msg.style.color = 'red';
        return;
      }

      // Simulamos el envío de un enlace de recuperación
      msg.textContent = 'Se ha enviado un enlace para restablecer tu contraseña.';
      msg.style.color = 'green';

      // Opcional: Redirigir al login después de un breve retraso
      setTimeout(() => (location.hash = '#/login'), 2000);

    } catch (err) {
      // Si ocurre un error, muestra el mensaje
      msg.textContent = `No se pudo recuperar la contraseña: ${err.message}`;
      msg.style.color = 'red';
    } finally {
      // Vuelve a habilitar el botón de envío
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}