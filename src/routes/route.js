import {
  registerUser,
  loginUser,
  CreateTask,
  updateUserProfile,
  getUserTasks,
  updateTask,
  deleteTask,
  recoverPassword,
} from "../services/userService.js";

const app = document.getElementById("app");

// Datos del usuario en memoria (se cargará desde el servidor)
let userData = {
  name: "",
  lastname: "",
  email: "",
  birthdate: "",
  bio: "",
};

// Variables para manejo de tareas
let currentTaskId = null;
let isEditMode = false;
let currentTaskData = null;

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

  if (name === "home") initHome();
  if (name === "board") initBoard();
  if (name === "register") initRegister();
  if (name === "forgot") initForgot();
  if (name === "about-us") initAbout();
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
  window.addEventListener("hashchange", handleRoute);
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
  const path =
    (location.hash.startsWith("#/") ? location.hash.slice(2) : "") || "home";
  const known = ["home", "board", "register", "forgot", "about-us"];
  let route = known.includes(path) ? path : "home";

  // Protección de ruta: solo permitir acceso a "board" y "about-us" si hay sesión
  if (route === "board" || route === "about-us") {
    const user = localStorage.getItem("userData");
    const fromFooter = localStorage.getItem("footerNavClick") === "1";
    if (!user) {
      // Guardar la ruta deseada para después del login
      localStorage.setItem("pendingRoute", route);
      route = "home";
      // Mostrar mensaje solo si viene del footer
      if (fromFooter) {
        setTimeout(() => {
          const msg = document.getElementById("loginMsg");
          if (msg) {
            msg.textContent = "Inicia sesión para poder continuar.";
            msg.style.color = "#e11d48";
          }
          localStorage.removeItem("footerNavClick");
        }, 100); // Espera a que cargue la vista
      }
    } else {
      localStorage.removeItem("footerNavClick");
    }
  }

  loadView(route).catch((err) => {
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
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const msg = document.getElementById("loginMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const email = emailInput?.value.trim();
    const password = passInput?.value.trim();

    if (!email || !password) {
      msg.textContent = "Por favor completa correo electrónico y contraseña.";
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const data = await loginUser({ email, password });

      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
        userData = { ...userData, ...data.user };

        // Redirigir a la ruta pendiente si existe
        const pendingRoute = localStorage.getItem("pendingRoute");
        if (pendingRoute) {
          localStorage.removeItem("pendingRoute");
          if (location.hash !== "#/" + pendingRoute) {
            location.hash = "#/" + pendingRoute;
          } else {
            handleRoute();
          }
        } else {
          if (location.hash !== "#/board") {
            location.hash = "#/board";
          } else {
            handleRoute();
          }
        }
        // Limpiar mensaje si existe
        if (msg) msg.textContent = "";
      } else {
        throw new Error("El backend no devolvió el usuario");
      }
    } catch (err) {
      if (msg) msg.textContent = `Error al iniciar sesión: ${err.message}`;
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });

  document.querySelectorAll(".footer-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      localStorage.setItem("footerNavClick", "1");
    });
  });
}

/**
 * Load user data from server
 */

/**
 * Initialize the "Board" view.
 * Sets up the task creation modal and handles task submission.
 * Also initializes the user profile modal and task management.
 *
 * @function initBoard
 * @returns {void}
 */
function initBoard() {
  const form = document.getElementById("taskForm");
  const taskModal = document.getElementById("taskModal");
  const taskModalTitle = document.getElementById("taskModalTitle");
  const saveTaskBtn = document.getElementById("saveTaskBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const newTaskBtn = document.getElementById("newTaskBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Elementos del modal de perfil
  const profileLink = document.getElementById("profileLink");
  const profileModal = document.getElementById("profileModal");
  const profileForm = document.getElementById("profileForm");
  const profileCancelBtn = document.getElementById("profileCancelBtn");
  const successMessage = document.getElementById("successMessage");
  const userAvatar = document.getElementById("userAvatar");

  // Elementos del modal de eliminación
  const deleteModal = document.getElementById("deleteModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  //Boton de nosotros
  const usButton = document.getElementById("usBtn");
  const backButton = document.getElementById("backButton");

  // ----------- AGREGADO PARA MENÚ DESPLEGABLE -----------
  const profileImage = document.getElementById("profileImage");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutLink = document.getElementById("logoutLink");

  // --------------Eliminar Cuenta --------------------------
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");

  //Eliminar la cuenta de usuario
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      if (
        confirm(
          "¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
        )
      ) {
        try {
          // Llama a tu función para eliminar la cuenta (ajusta el nombre según tu backend)
          await deleteUserAccount(); // Debes tener esta función implementada
          localStorage.clear();
          location.hash = "#/home";
          alert("Cuenta eliminada correctamente.");
        } catch (err) {
          alert("Error al eliminar la cuenta.");
        }
      }
    });
  }

  // Mostrar el menú desplegable al hacer clic en la imagen de perfil
  if (profileImage && dropdownMenu) {
    profileImage.addEventListener("click", () => {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });
  }

  // Cerrar el menú desplegable al hacer click fuera de él
  document.addEventListener("click", function (e) {
    if (
      dropdownMenu &&
      dropdownMenu.style.display === "block" &&
      !dropdownMenu.contains(e.target) &&
      e.target !== profileImage
    ) {
      dropdownMenu.style.display = "none";
    }
  });
  // Evento para abrir el modal de perfil desde el menú
  if (profileLink && profileModal) {
    profileLink.addEventListener("click", (e) => {
      e.preventDefault();
      showModal(profileModal);
      loadUserDataInForm();
      if (dropdownMenu) dropdownMenu.style.display = "none";
    });
  }

  // Cerrar el menú desplegable al hacer click en cualquier opción del menú
  if (dropdownMenu) {
    dropdownMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        dropdownMenu.style.display = "none";
      });
    });
  }

  // Evento para cerrar sesión desde el menú
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      const isConfirmed = confirm("¿Estás seguro que deseas cerrar sesión?");
      if (isConfirmed) {
        localStorage.clear();
        location.hash = "#/home";
      }
    });
  }

  // Función para actualizar el avatar con las iniciales del usuario
  function updateAvatar() {
    if (userData.name && userData.lastname) {
      const initials = (
        userData.name.charAt(0) + userData.lastname.charAt(0)
      ).toUpperCase();
      userAvatar.textContent = initials;
    } else {
      userAvatar.textContent = "U";
    }
  }

  // Función para cargar datos del usuario en el formulario de perfil
  function loadUserDataInForm() {
    // Cargar datos desde localStorage si existen
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        userData = { ...userData, ...JSON.parse(stored) };
      } catch (e) {
        // Si hay error, no sobreescribas userData
      }
    }

    document.getElementById("profileName").value = userData.username || "";
    document.getElementById("profileLastname").value = userData.lastname || "";
    document.getElementById("profileEmail").value = userData.email || "";
    // Formatear la fecha para el input type="date"
    if (userData.birthdate) {
      const fecha = new Date(userData.birthdate);
      document.getElementById("profileBirthdate").value = fecha
        .toISOString()
        .split("T")[0];
    } else {
      document.getElementById("profileBirthdate").value = "";
    }
    document.getElementById("profileBio").value = userData.bio || "";
    updateAvatar();
  }

  if (usButton) {
    usButton.addEventListener("click", () => {
      location.hash = "#/about-us"; // Cambia la URL a la vista "Sobre Nosotros"
    });
  }
  // Función para mostrar modal
  function showModal(modal) {
    modal.classList.add("show");
  }

  // Función para ocultar modal
  function hideModal(modal) {
    modal.classList.remove("show");
    if (modal === profileModal && successMessage) {
      successMessage.style.display = "none";
    }
  }

  // Función para resetear el formulario de tareas
  function resetTaskForm() {
    form.reset();
    document.getElementById("taskId").value = "";
    currentTaskId = null;
    currentTaskData = null;
    isEditMode = false;
    taskModalTitle.textContent = "Crear Tarea";
    saveTaskBtn.textContent = "Guardar";
  }

  // Función para llenar el formulario con datos de la tarea para editar
  function fillTaskForm(task) {
    document.getElementById("taskId").value = task._id;
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDetails").value = task.details;
    document.getElementById("taskDate").value = task.date;
    document.getElementById("taskTime").value = task.time;
    document.getElementById("taskStatus").value = task.status;
    currentTaskId = task._id;
    currentTaskData = { ...task };
    isEditMode = true;
    taskModalTitle.textContent = "Editar Tarea";
    saveTaskBtn.textContent = "Actualizar";
  }

  // Event listeners para el modal de perfil
  if (profileLink && profileModal) {
    profileLink.addEventListener("click", () => {
      loadUserDataInForm();
      showModal(profileModal);
    });

    profileCancelBtn?.addEventListener("click", () => {
      hideModal(profileModal);
    });

    // Event listener para el formulario de perfil
    profileForm?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        id: userData.id,
        username: document.getElementById("profileName").value, // <--- usa el mismo id que en loadUserDataInForm
        lastname: document.getElementById("profileLastname").value,
        email: document.getElementById("profileEmail").value,
        birthdate: document.getElementById("profileBirthdate").value,
        bio: document.getElementById("profileBio").value,
      };

      try {
        const saveBtn = profileForm.querySelector(".btn-save");
        const originalText = saveBtn.textContent;
        saveBtn.textContent = "Guardando...";
        saveBtn.disabled = true;

        // Llamar al servicio para actualizar el perfil
        await updateUserProfile(formData);

        // Actualizar datos locales
        userData = { ...userData, ...formData };
        localStorage.setItem("userData", JSON.stringify(userData));
        updateAvatar();

        console.log("Datos del usuario actualizados:", userData);

        // Mostrar mensaje de éxito
        if (successMessage) {
          successMessage.style.display = "block";
          setTimeout(() => {
            successMessage.style.display = "none";
          }, 3000);
        }

        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      } catch (error) {
        console.error("Error al actualizar perfil:", error);
        alert("Error al actualizar el perfil. Por favor, intenta de nuevo.");

        const saveBtn = profileForm.querySelector(".btn-save");
        saveBtn.textContent = "Guardar Cambios";
        saveBtn.disabled = false;
      }
    });
  }

  // Event listeners para tareas
  newTaskBtn?.addEventListener("click", () => {
    resetTaskForm();
    showModal(taskModal);
  });

  cancelBtn?.addEventListener("click", () => {
    resetTaskForm();
    hideModal(taskModal);
  });

  // Event listener para el modal de eliminación
  cancelDeleteBtn?.addEventListener("click", () => {
    hideModal(deleteModal);
    currentTaskId = null;
    currentTaskData = null;
  });

  confirmDeleteBtn?.addEventListener("click", async () => {
    if (currentTaskId) {
      try {
        await deleteTask(currentTaskId);

        // Remover la tarea del DOM
        document.querySelector(`[data-task-id="${currentTaskId}"]`)?.remove();

        // Verificar si la columna está vacía y mostrar mensaje
        checkEmptyColumns();

        hideModal(deleteModal);
        currentTaskId = null;
        currentTaskData = null;

        console.log("Tarea eliminada exitosamente");
      } catch (error) {
        console.error("Error al eliminar la tarea:", error);
        alert("Error al eliminar la tarea. Por favor, intenta de nuevo.");
      }
    }
  });

  // Event listener para el formulario de tareas
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value;
    const details = document.getElementById("taskDetails").value;
    const date = document.getElementById("taskDate").value;
    const time = document.getElementById("taskTime").value;
    const status = document.getElementById("taskStatus").value;

    if (!title || !details || !date || !time || !status) {
      alert("Por favor completa todos los campos.");
      return;
    }

    // Mapeo front → back
    const statusMap = {
      todo: "Por Hacer",
      doing: "Haciendo",
      done: "Hecho",
    };

    // Mapeo back → front
    const reverseStatusMap = {
      "Por Hacer": "todo",
      Haciendo: "doing",
      Hecho: "done",
    };

    // Datos para el backend
    const backendTaskData = {
      title,
      details,
      date,
      time,
      status: statusMap[status] || status,
    };

    try {
      const saveBtn = form.querySelector(".btn-save");
      const originalText = saveBtn.textContent;
      saveBtn.textContent = isEditMode ? "Actualizando..." : "Guardando...";
      saveBtn.disabled = true;

      let taskResult;

      if (isEditMode && currentTaskId) {
        // Actualizar tarea existente
        taskResult = await updateTask(currentTaskId, backendTaskData);

        // Remover la tarea antigua del DOM si cambió de columna
        const oldTaskElement = document.querySelector(
          `[data-task-id="${currentTaskId}"]`
        );
        if (oldTaskElement) {
          oldTaskElement.remove();
        }

        // Agregar la tarea actualizada
        const frontendTask = {
          ...taskResult,
          id: currentTaskId,
          status: reverseStatusMap[taskResult.status] || status,
        };

        addTaskToDOM(frontendTask);
        console.log("Tarea actualizada exitosamente");
      } else {
        // Crear nueva tarea
        taskResult = await CreateTask(backendTaskData);

        const frontendTask = {
          ...taskResult,
          status: reverseStatusMap[taskResult.status] || status,
        };

        addTaskToDOM(frontendTask);
        console.log("Nueva tarea creada exitosamente");
      }

      // Verificar columnas vacías
      checkEmptyColumns();

      hideModal(taskModal);
      resetTaskForm();

      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      alert("Error al guardar la tarea. Por favor, intenta de nuevo.");

      const saveBtn = form.querySelector(".btn-save");
      saveBtn.textContent = isEditMode ? "Actualizar" : "Guardar";
      saveBtn.disabled = false;
    }
  });

  // Función para verificar columnas vacías
  function checkEmptyColumns() {
    ["todo", "doing", "done"].forEach((status) => {
      const taskList = document.getElementById(`${status}-tasks`);
      if (taskList && taskList.children.length === 0) {
        const emptyStateMessages = {
          todo: "No hay tareas pendientes",
          doing: "No hay tareas en progreso",
          done: "No hay tareas completadas",
        };

        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.textContent = emptyStateMessages[status];
        taskList.appendChild(emptyState);
      }
    });
  }

  // Función para agregar la tarea al DOM
  function addTaskToDOM(task) {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item";
    taskItem.setAttribute("data-task-id", task._id);
    taskItem.innerHTML = `
      <div class="task-header">
        <div class="task-title">${task.title}</div>
        <div class="task-actions">
          <button class="task-action-btn task-edit-btn" onclick="editTask('${task._id}')" title="Editar tarea">
            <i class="fas fa-edit"></i>
          </button>
          <button class="task-action-btn task-delete-btn" onclick="confirmDeleteTask('${task._id}')" title="Eliminar tarea">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="task-details">${task.details}</div>
      <div class="task-date">${task.date} ${task.time}</div>
    `;

    const taskList = document.getElementById(`${task.status}-tasks`);
    if (taskList) {
      // Remover el estado vacío si existe
      const emptyState = taskList.querySelector(".empty-state");
      if (emptyState) {
        emptyState.remove();
      }
      taskList.appendChild(taskItem);
    }
  }

  // Función para cargar las tareas desde la base de datos
  async function loadTasksFromDatabase() {
    try {
      const tasks = await getUserTasks();

      // Mapeo back → front para mostrar tareas
      const reverseStatusMap = {
        "Por Hacer": "todo",
        Haciendo: "doing",
        Hecho: "done",
      };

      tasks.forEach((task) => {
        const frontendTask = {
          ...task,
          status: reverseStatusMap[task.status] || task.status,
        };
        addTaskToDOM(frontendTask);
      });
    } catch (err) {
      console.error("Error al cargar tareas:", err);
    }
  }

  // Funciones globales para los botones de acción (necesarias para onclick)
  window.editTask = function (taskId) {
    // Encontrar la tarea en el DOM para obtener sus datos
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      const taskData = {
        _id: taskId,
        title: taskElement.querySelector(".task-title").textContent,
        details: taskElement.querySelector(".task-details").textContent,
        date: taskElement.querySelector(".task-date").textContent.split(" ")[0],
        time: taskElement.querySelector(".task-date").textContent.split(" ")[1],
        status: getTaskStatus(taskElement),
      };

      fillTaskForm(taskData);
      showModal(taskModal);
    }
  };

  window.confirmDeleteTask = function (taskId) {
    currentTaskId = taskId;
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      currentTaskData = {
        _id: taskId,
        title: taskElement.querySelector(".task-title").textContent,
      };
    }
    showModal(deleteModal);
  };

  // Función auxiliar para obtener el estado de la tarea basado en su contenedor
  function getTaskStatus(taskElement) {
    const parent = taskElement.parentElement;
    if (parent.id === "todo-tasks") return "todo";
    if (parent.id === "doing-tasks") return "doing";
    if (parent.id === "done-tasks") return "done";
    return "todo";
  }

  // Cerrar modales al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (e.target === profileModal) {
      hideModal(profileModal);
    }
    if (e.target === taskModal) {
      resetTaskForm();
      hideModal(taskModal);
    }
    if (e.target === deleteModal) {
      hideModal(deleteModal);
      currentTaskId = null;
      currentTaskData = null;
    }
  });

  // Cargar tareas y inicializar avatar
  loadTasksFromDatabase();
  updateAvatar();

  // Función de cerrar sesión
  logoutBtn?.addEventListener("click", () => {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
      //localStorage.clear();
      localStorage.removeItem("userData");
      userData = { name: "", lastname: "", email: "", birthdate: "", bio: "" };
      location.hash = "#/home";
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
  const form = document.getElementById("registerForm");
  const userInput = document.getElementById("username");
  const lastnameInput = document.getElementById("lastname");
  const birthdateInput = document.getElementById("brithdate");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const confirmPassInput = document.getElementById("confirmPassword");
  const msg = document.getElementById("registerMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const fields = [
      userInput,
      lastnameInput,
      birthdateInput,
      emailInput,
      passInput,
      confirmPassInput,
    ];
    fields.forEach((field) => field.classList.remove("error"));

    const username = userInput?.value.trim();
    const lastname = lastnameInput?.value.trim();
    const birthdate = birthdateInput?.value.trim();
    const email = emailInput?.value.trim();
    const password = passInput?.value.trim();
    const confirmPassword = confirmPassInput?.value.trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (
      !username ||
      !lastname ||
      !birthdate ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      msg.textContent = "Por favor completa todos los campos.";

      if (!username) userInput.classList.add("error");
      if (!lastname) lastnameInput.classList.add("error");
      if (!birthdate) birthdateInput.classList.add("error");
      if (!email) emailInput.classList.add("error");
      if (!password) passInput.classList.add("error");
      if (!confirmPassword) confirmPassInput.classList.add("error");

      if (!username) userInput.focus();
      else if (!lastname) lastnameInput.focus();
      else if (!birthdate) birthdateInput.focus();
      else if (!email) emailInput.focus();
      else if (!password) passInput.focus();
      else if (!confirmPassword) confirmPassInput.focus();

      return;
    }

    if (!passwordRegex.test(password)) {
      msg.textContent =
        "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.";
      passInput.classList.add("error");
      passInput.focus();
      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = "Las contraseñas no coinciden.";
      passInput.classList.add("error");
      confirmPassInput.classList.add("error");
      passInput.focus();
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const data = await registerUser({
        username,
        lastname,
        birthdate,
        email,
        password,
        bio: "",
      });
      msg.textContent = "Registro exitoso";

      document.getElementById("successModal").style.display = "flex";

      setTimeout(() => {
        document.getElementById("successModal").style.display = "none";
        location.hash = "#/home";
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
  const form = document.getElementById("recoverForm");
  const emailInput = document.getElementById("email");
  const msg = document.getElementById("message");
  const submitBtn = document.getElementById("submitBtn");

  // Elementos del modal de confirmación
  const confirmationModal = document.getElementById("confirmationModal");
  const confirmationOkBtn = document.getElementById("confirmationOkBtn");

  if (!form) return;

  // Función para mostrar modal
  function showModal(modal) {
    modal.classList.add("show");
  }

  // Función para ocultar modal
  function hideModal(modal) {
    modal.classList.remove("show");
  }

  // Event listener para el botón OK del modal
  confirmationOkBtn?.addEventListener("click", () => {
    hideModal(confirmationModal);
    // Redirigir al login después de cerrar el modal
    setTimeout(() => {
      location.hash = "#/home";
    }, 300);
  });

  // Event listener para cerrar modal al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (e.target === confirmationModal) {
      hideModal(confirmationModal);
      setTimeout(() => {
        location.hash = "#/home";
      }, 300);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const email = emailInput?.value.trim();

    if (!email) {
      msg.innerHTML =
        '<div class="message-error">Por favor ingresa tu correo electrónico.</div>';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      msg.innerHTML =
        '<div class="message-error">Por favor ingresa un correo electrónico válido.</div>';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    try {
      // Hacer la petición real al backend para recuperación de contraseña
      await recoverPassword({ email });

      // Mostrar el modal de confirmación
      showModal(confirmationModal);

      // Limpiar el formulario
      form.reset();
      msg.textContent = "";
    } catch (err) {
      msg.innerHTML = `<div class="message-error">Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar Enlace";
    }
  });
}

function initAbout() {
  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", () => {
      location.hash = "#/board";
    });
  }
}
