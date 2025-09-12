import { registerUser } from '../services/userService.js';

const app = document.getElementById('app');

// Función para cargar la vista
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

async function loadView(name) {
  const res = await fetch(viewURL(name));
  if (!res.ok) throw new Error(`Failed to load view: ${name}`);
  const html = await res.text();
  app.innerHTML = html;

  if (name === 'home') initHome();
  if (name === 'board') initBoard();
  if (name === 'register') initRegister();
  if (name === 'forgot') initForgot();
}

// Inicializar el enrutador con hash
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // first render
}

function handleRoute() {
  const path = (location.hash.startsWith('#/') ? location.hash.slice(2) : '') || 'home';
  const known = ['home', 'board', 'register', 'forgot'];
  const route = known.includes(path) ? path : 'home';

  loadView(route).catch(err => {
    console.error(err);
    app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
  });
}

// Inicialización de la vista "home"
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

// Inicialización de la vista "board"
function initBoard() {
  const form = document.getElementById('todoForm');
  const input = document.getElementById('newTodo');
  const list = document.getElementById('todoList');

  // Mostrar modal de crear tarea
  const newTaskBtn = document.getElementById('newTaskBtn');
  const taskModal = document.getElementById('taskModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const taskForm = document.getElementById('taskForm');

  // Mostrar el modal
  newTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'flex';
  });

  // Cerrar el modal
  cancelBtn.addEventListener('click', () => {
    taskModal.style.display = 'none';
  });

  // Manejar el envío del formulario del modal
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const details = document.getElementById('taskDetails').value;
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    const status = document.getElementById('taskStatus').value;

    // Validación de campos
    if (!title || !details || !date || !time || !status) {
      alert('Por favor completa todos los campos.');
      return;
    }

    // Agregar la tarea (esto se puede manejar como necesites)
    const newTask = {
      title,
      details,
      date,
      time,
      status,
    };

    console.log('Nueva tarea agregada:', newTask);

    // Cerrar el modal y resetear formulario
    taskModal.style.display = 'none';
    taskForm.reset();

    
  });
}

// Función para inicializar el registro (Formulario)
function initRegister() {
  // El código para manejar el registro aquí
}

// Función para la vista de "recuperar contraseña"
function initForgot() {
  // El código para manejar la recuperación de contraseña
}
