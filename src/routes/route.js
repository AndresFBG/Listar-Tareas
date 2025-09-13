import { registerUser } from '../services/userService.js';

const app = document.getElementById('app');

/**
 * Generate the URL of the requested view based on its name.
 *
 * @param {string} name - The name of the view (e.g., "home", "board", "register", "forgot").
 * @returns {URL} The resolved URL pointing to the HTML file of the view.
 */
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

/**
 * Load and render a specific view into the app container.
 *
 * @async
 * @param {string} name - The name of the view to load.
 * @throws {Error} If the requested view cannot be fetched successfully.
 * @returns {Promise<void>} Resolves when the view has been loaded and initialized.
 */
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

/**
 * Initialize the router that handles view rendering
 * based on hash changes in the URL.
 *
 * @export
 * @function initRouter
 * @returns {void}
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // initial render
}

/**
 * Handle the current route by reading the hash from the URL
 * and loading the corresponding view.
 *
 * @function handleRoute
 * @returns {void}
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

/**
 * Initialize the "Home" view.
 * Handles the login/registration form and submits
 * the data to the user service.
 *
 * @function initHome
 * @returns {void}
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
 * Initialize the "Board" view.
 * Sets up the task creation modal and handles task submission.
 *
 * @function initBoard
 * @returns {void}
 */
function initBoard() {
  const form = document.getElementById('todoForm');
  const input = document.getElementById('newTodo');
  const list = document.getElementById('todoList');

  const newTaskBtn = document.getElementById('newTaskBtn');
  const taskModal = document.getElementById('taskModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const taskForm = document.getElementById('taskForm');

  // Mostrar el modal para crear una nueva tarea
  newTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'flex';
  });

  // Cerrar el modal
  cancelBtn.addEventListener('click', () => {
    taskModal.style.display = 'none';
  });

  // Al enviar el formulario, agregar la tarea
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const details = document.getElementById('taskDetails').value;
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    const status = document.getElementById('taskStatus').value;

    // Validación de los campos
    if (!title || !details || !date || !time || !status) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const newTask = { title, details, date, time, status };
    console.log('Nueva tarea agregada:', newTask);

    // Añadir la tarea al DOM
    addTaskToDOM(newTask);

    // Guardar las tareas en el localStorage
    saveTaskToLocalStorage(newTask);

    // Cerrar el modal y resetear el formulario
    taskModal.style.display = 'none';
    taskForm.reset();
  });

  // Función para agregar la tarea al DOM
  function addTaskToDOM(task) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
      <div class="task-title">${task.title}</div>
      <div class="task-date">${task.date} ${task.time}</div>
      <div class="task-status">${task.status}</div>
    `;

    list.appendChild(taskItem);
  }

  // Función para guardar la tarea en el localStorage
  function saveTaskToLocalStorage(task) {
    const tasks = getTasksFromLocalStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Función para obtener las tareas desde el localStorage
  function getTasksFromLocalStorage() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  }

  // Cargar las tareas desde el localStorage al cargar la página
  function loadTasksFromLocalStorage() {
    const tasks = getTasksFromLocalStorage();
    tasks.forEach(task => addTaskToDOM(task));
  }

  // Cargar las tareas cuando se inicia la página
  loadTasksFromLocalStorage();
}

/**
 * Initialize the "Register" view.
 * Validates and handles user registration with multiple fields.
 *
 * @function initRegister
 * @returns {void}
 */
function initRegister() {
  const form = document.getElementById('registerForm');
  const userInput = document.getElementById('username');
  const lastnameInput = document.getElementById('lastname');
  const birthdateInput = document.getElementById('brithdate');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const confirmPassInput = document.getElementById('confirmPassword');
  const msg = document.getElementById('registerMsg');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();  
    msg.textContent = ''; 

  
    const fields = [userInput, lastnameInput, birthdateInput, emailInput, passInput, confirmPassInput];
    fields.forEach(field => field.classList.remove('error'));

    
    const username = userInput?.value.trim();
    const lastname = lastnameInput?.value.trim();
    const birthdate = birthdateInput?.value.trim();  
    const email = emailInput?.value.trim();
    const password = passInput?.value.trim();
    const confirmPassword = confirmPassInput?.value.trim();

   
    if (!username || !lastname || !birthdate || !email || !password || !confirmPassword) {
      msg.textContent = 'Por favor completa todos los campos.';
      
      
      if (!username) userInput.classList.add('error');
      if (!lastname) lastnameInput.classList.add('error');
      if (!birthdate) birthdateInput.classList.add('error');  
      if (!email) emailInput.classList.add('error');
      if (!password) passInput.classList.add('error');
      if (!confirmPassword) confirmPassInput.classList.add('error');
      
      
      if (!username) userInput.focus();
      else if (!lastname) lastnameInput.focus();
      else if (!birthdate) birthdateInput.focus();  
      else if (!email) emailInput.focus();
      else if (!password) passInput.focus();
      else if (!confirmPassword) confirmPassInput.focus();

      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = 'Las contraseñas no coinciden.';
      passInput.classList.add('error');  
      confirmPassInput.classList.add('error');  
      passInput.focus();
      return;
    }

    
    form.querySelector('button[type="submit"]').disabled = true;

    try {
      
      const data = await registerUser({ username, lastname, birthdate, email, password });
      msg.textContent = 'Registro exitoso';  

      
      document.getElementById('successModal').style.display = 'flex';

      
      setTimeout(() => {
        document.getElementById('successModal').style.display = 'none';
        location.hash = '#/home';  
      }, 3000);

    } catch (err) {
      
      msg.textContent = `Error: ${err.message}`;
    } finally {
      
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

function initForgot() {
  const form = document.getElementById('recoverForm');
  const emailInput = document.getElementById('email');
  const msg = document.getElementById('message');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const email = emailInput?.value.trim();

    if (!email) {
      msg.textContent = 'Por favor ingresa tu correo electrónico.';
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const users = getUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        msg.textContent = 'El correo no está registrado.';
        msg.style.color = 'red';
        return;
      }

      msg.textContent = 'Se ha enviado un enlace para restablecer tu contraseña.';
      msg.style.color = 'green';

      setTimeout(() => (location.hash = '#/login'), 2000);

    } catch (err) {
      msg.textContent = `No se pudo recuperar la contraseña: ${err.message}`;
      msg.style.color = 'red';
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}