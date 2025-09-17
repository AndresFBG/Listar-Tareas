import { registerUser, loginUser, CreateTask, updateUserProfile, getUserProfile, getUserTasks } from '../services/userService.js';

const app = document.getElementById('app');

// Datos del usuario en memoria (se cargará desde el servidor)
let userData = {
  name: '',
  lastname: '',
  email: '',
  birthdate: '',
  bio: ''
};

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
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const msg = document.getElementById('loginMsg');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const email = emailInput?.value.trim();
    const password = passInput?.value.trim();

    if (!email || !password) {
      msg.textContent = 'Por favor completa correo electrónico y contraseña.';
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const data = await loginUser({ email, password });

      // Guardar token en localStorage
      localStorage.setItem('token', data.token);

      // Cargar datos del usuario
      await loadUserData();

      // Redirigir al tablero
      location.hash = '#/board';
    } catch (err) {
      if (msg) msg.textContent = `Error al iniciar sesión: ${err.message}`;
    }
    finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

/**
 * Load user data from server
 */
async function loadUserData() {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const userProfile = await getUserProfile();
      userData = { ...userData, ...userProfile };
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

/**
 * Initialize the "Board" view.
 * Sets up the task creation modal and handles task submission.
 * Also initializes the user profile modal.
 *
 * @function initBoard
 * @returns {void}
 */
function initBoard() {
  const form = document.getElementById('taskForm');
  const taskModal = document.getElementById('taskModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const newTaskBtn = document.getElementById('newTaskBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Elementos del modal de perfil
  const profileBtn = document.getElementById('profileBtn');
  const profileModal = document.getElementById('profileModal');
  const profileForm = document.getElementById('profileForm');
  const profileCancelBtn = document.getElementById('profileCancelBtn');
  const successMessage = document.getElementById('successMessage');
  const userAvatar = document.getElementById('userAvatar');

  // Función para actualizar el avatar con las iniciales del usuario
  function updateAvatar() {
    if (userData.name && userData.lastname) {
      const initials = (userData.name.charAt(0) + userData.lastname.charAt(0)).toUpperCase();
      userAvatar.textContent = initials;
    } else {
      userAvatar.textContent = 'U';
    }
  }

  // Función para cargar datos del usuario en el formulario de perfil
  function loadUserDataInForm() {
    document.getElementById('profileName').value = userData.name || '';
    document.getElementById('profileLastname').value = userData.lastname || '';
    document.getElementById('profileEmail').value = userData.email || '';
    document.getElementById('profileBirthdate').value = userData.birthdate || '';
    document.getElementById('profileBio').value = userData.bio || '';
    updateAvatar();
  }

  // Función para mostrar modal
  function showModal(modal) {
    modal.classList.add('show');
  }

  // Función para ocultar modal
  function hideModal(modal) {
    modal.classList.remove('show');
    if (modal === profileModal && successMessage) {
      successMessage.style.display = 'none';
    }
  }

  // Event listeners para el modal de perfil
  if (profileBtn && profileModal) {
    profileBtn.addEventListener('click', () => {
      loadUserDataInForm();
      showModal(profileModal);
    });

    profileCancelBtn?.addEventListener('click', () => {
      hideModal(profileModal);
    });

    // Event listener para el formulario de perfil
    profileForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('profileName').value,
        lastname: document.getElementById('profileLastname').value,
        email: document.getElementById('profileEmail').value,
        birthdate: document.getElementById('profileBirthdate').value,
        bio: document.getElementById('profileBio').value
      };
      
      try {
        const saveBtn = profileForm.querySelector('.btn-save');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Guardando...';
        saveBtn.disabled = true;
        
        // Llamar al servicio para actualizar el perfil
        await updateUserProfile(formData);
        
        // Actualizar datos locales
        userData = { ...userData, ...formData };
        updateAvatar();
        
        console.log('Datos del usuario actualizados:', userData);
        
        // Mostrar mensaje de éxito
        if (successMessage) {
          successMessage.style.display = 'block';
          setTimeout(() => {
            successMessage.style.display = 'none';
          }, 3000);
        }
        
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        alert('Error al actualizar el perfil. Por favor, intenta de nuevo.');
        
        const saveBtn = profileForm.querySelector('.btn-save');
        saveBtn.textContent = 'Guardar Cambios';
        saveBtn.disabled = false;
      }
    });
  }

  // Funcionalidad existente del modal de tareas
  newTaskBtn?.addEventListener('click', () => {
    showModal(taskModal);
    console.log('Modal abierto');
  });

  cancelBtn?.addEventListener('click', () => {
    hideModal(taskModal);
    console.log('Modal cerrado');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const details = document.getElementById('taskDetails').value;
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    const status = document.getElementById('taskStatus').value;

    if (!title || !details || !date || !time || !status) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const newTask = { title, details, date, time, status };
    console.log('Nueva tarea agregada:', newTask);

    addTaskToDOM(newTask);
    await saveTaskToDatabase(newTask);

    hideModal(taskModal);
    form.reset();
  });

  // Función para agregar la tarea al DOM
  function addTaskToDOM(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
      <div class="task-title">${task.title}</div>
      <div class="task-details">${task.details}</div>
      <div class="task-date">${task.date} ${task.time}</div>
    `;
    
    const taskList = document.getElementById(`${task.status}-tasks`);
    if (taskList) {
      // Remover el estado vacío si existe
      const emptyState = taskList.querySelector('.empty-state');
      if (emptyState) {
        emptyState.remove();
      }
      taskList.appendChild(taskItem);
    }
  }

  // Función para guardar la tarea en la base de datos
  async function saveTaskToDatabase(task) {
    try {
      await CreateTask(task);
      console.log('Tarea guardada en la base de datos');
    } catch (err) {
      console.error('Error al guardar la tarea:', err);
      alert('Error al guardar la tarea');
    }
  }

  // Función para cargar las tareas desde la base de datos
  async function loadTasksFromDatabase() {
    try {
      const tasks = await getUserTasks();
      tasks.forEach(task => {
        addTaskToDOM(task);
      });
    } catch (err) {
      console.error(err);
      alert('Hubo un error al cargar las tareas');
    }
  }

  // Cerrar modales al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (e.target === profileModal) {
      hideModal(profileModal);
    }
    if (e.target === taskModal) {
      hideModal(taskModal);
    }
  });

  // Cargar tareas y inicializar avatar
  loadTasksFromDatabase();
  updateAvatar();

  // Función de cerrar sesión
  logoutBtn?.addEventListener('click', () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.clear();
      userData = { name: '', lastname: '', email: '', birthdate: '', bio: '' };
      location.hash = '#/home';
    }
  });
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

/**
 * Initialize the "Forgot" view.
 * Handles password recovery functionality.
 *
 * @function initForgot
 * @returns {void}
 */
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
      // Aquí deberías implementar la lógica de recuperación de contraseña
      // const response = await recoverPassword({ email });
      
      msg.textContent = 'Se ha enviado un enlace para restablecer tu contraseña.';
      msg.style.color = 'green';

      setTimeout(() => (location.hash = '#/home'), 2000);

    } catch (err) {
      msg.textContent = `No se pudo recuperar la contraseña: ${err.message}`;
      msg.style.color = 'red';
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

