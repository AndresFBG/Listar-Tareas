import { http } from '../api/http.js';

/**
 * Register a new user in the system.
 *
 * Sends a POST request to the backend API (`/api/v1/users`)
 * with the provided user data.
 *
 * @async
 * @function registerUser
 * @param {Object} params - User registration data.
 * @param {string} params.username - The username of the new user.
 * @param {string} params.lastname - The lastname of the new user.
 * @param {string} params.birthdate - The birthdate of the new user.
 * @param {string} params.email - The email of the new user.
 * @param {string} params.password - The password of the new user.
 * @returns {Promise<Object>} The created user object returned by the API.
 * @throws {Error} If the API responds with an error status or message.
 *
 * @example
 * try {
 *   const user = await registerUser({ 
 *     username: "alice", 
 *     lastname: "doe", 
 *     birthdate: "1990-01-01", 
 *     email: "alice@example.com", 
 *     password: "secret" 
 *   });
 *   console.log("User created:", user);
 * } catch (err) {
 *   console.error("Registration failed:", err.message);
 * }
 */
export async function registerUser({ username, lastname, birthdate, email, password }) {
  return http.post('/api/v1/users', { username, lastname, birthdate, email, password });
}

/**
 * Login user
 * @param {Object} params - Login data
 * @param {string} params.email - User email
 * @param {string} params.password - User password
 * @returns {Promise<Object>} Login response with token and user data
 * 
 * @example
 * try {
 *   const loginData = await loginUser({ email: "user@example.com", password: "password123" });
 *   console.log("Login successful:", loginData);
 * } catch (err) {
 *   console.error("Login failed:", err.message);
 * }
 */
export async function loginUser({ email, password }) {
  return http.post('/api/v1/auth/login', { email, password });
}

/**
 * Create a new task for the authenticated user
 * @param {Object} taskData - Task data
 * @param {string} taskData.title - Task title
 * @param {string} taskData.details - Task details
 * @param {string} taskData.date - Task date
 * @param {string} taskData.time - Task time
 * @param {string} taskData.status - Task status (Por Hacer, Haciendo, Hecho)
 * @returns {Promise<Object>} Created task object
 * 
 * @example
 * try {
 *   const task = await CreateTask({
 *     title: "Complete project",
 *     details: "Finish the user authentication module",
 *     date: "2024-01-15",
 *     time: "14:30",
 *     status: "Por Hacer"
 *   });
 *   console.log("Task created:", task);
 * } catch (err) {
 *   console.error("Task creation failed:", err.message);
 * }
 */
export async function CreateTask({ title, details, date, time, status }) {
  return http.post('/api/v1/tasks', { title, details, date, time, status });
}

/**
 * Get current user's profile information
 * @returns {Promise<Object>} User profile data
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   const profile = await getUserProfile();
 *   console.log("User profile:", profile);
 * } catch (err) {
 *   console.error("Failed to get profile:", err.message);
 * }
 */
export async function getUserProfile() {
  return http.get('/api/v1/users/profile');
}

/**
 * Update current user's profile information
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.name - User's first name
 * @param {string} profileData.lastname - User's last name
 * @param {string} profileData.email - User's email
 * @param {string} profileData.birthdate - User's birthdate
 * @param {string} [profileData.bio] - User's bio (optional)
 * @returns {Promise<Object>} Updated user profile data
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   const updatedProfile = await updateUserProfile({
 *     name: "John",
 *     lastname: "Doe", 
 *     email: "john.doe@example.com",
 *     birthdate: "1990-05-15",
 *     bio: "Software developer passionate about technology"
 *   });
 *   console.log("Profile updated:", updatedProfile);
 * } catch (err) {
 *   console.error("Profile update failed:", err.message);
 * }
 */
export async function updateUserProfile({ name, lastname, email, birthdate, bio }) {
  return http.put('/api/v1/users/profile', { name, lastname, email, birthdate, bio });
}

/**
 * Get all tasks for the current authenticated user
 * @returns {Promise<Array>} Array of user tasks
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   const tasks = await getUserTasks();
 *   console.log("User tasks:", tasks);
 * } catch (err) {
 *   console.error("Failed to get tasks:", err.message);
 * }
 */
export async function getUserTasks() {
  return http.get('/api/v1/tasks');
}

/**
 * Update a specific task
 * @param {string} taskId - Task ID to update
 * @param {Object} taskData - Task data to update
 * @param {string} [taskData.title] - Task title
 * @param {string} [taskData.details] - Task details
 * @param {string} [taskData.date] - Task date
 * @param {string} [taskData.time] - Task time
 * @param {string} [taskData.status] - Task status (Por Hacer, Haciendo, Hecho)
 * @returns {Promise<Object>} Updated task object
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   const updatedTask = await updateTask("task123", {
 *     title: "Updated task title",
 *     status: "Hecho"
 *   });
 *   console.log("Task updated:", updatedTask);
 * } catch (err) {
 *   console.error("Task update failed:", err.message);
 * }
 */
export async function updateTask(taskId, { title, details, date, time, status }) {
  return http.put(`/api/v1/tasks/${taskId}`, { title, details, date, time, status });
}

/**
 * Delete a specific task
 * @param {string} taskId - Task ID to delete
 * @returns {Promise<Object>} Delete confirmation
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   await deleteTask("task123");
 *   console.log("Task deleted successfully");
 * } catch (err) {
 *   console.error("Task deletion failed:", err.message);
 * }
 */
export async function deleteTask(taskId) {
  const response = await fetch(`/api/v1/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok) {
    throw new Error('No se pudo eliminar la tarea');
  }
  return await response.json();
}

/**
 * Get a specific task by ID
 * @param {string} taskId - Task ID to retrieve
 * @returns {Promise<Object>} Task object
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   const task = await getTaskById("task123");
 *   console.log("Task retrieved:", task);
 * } catch (err) {
 *   console.error("Failed to get task:", err.message);
 * }
 */
export async function getTaskById(taskId) {
  return http.get(`/api/v1/tasks/${taskId}`);
}

/**
 * Get tasks filtered by status
 * @param {string} status - Task status to filter by (Por Hacer, Haciendo, Hecho)
 * @returns {Promise<Array>} Array of tasks with the specified status
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   const todoTasks = await getTasksByStatus("Por Hacer");
 *   console.log("Todo tasks:", todoTasks);
 * } catch (err) {
 *   console.error("Failed to get tasks by status:", err.message);
 * }
 */
export async function getTasksByStatus(status) {
  return http.get(`/api/v1/tasks?status=${encodeURIComponent(status)}`);
}

/**
 * Search tasks by title or details
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching tasks
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   const tasks = await searchTasks("authentication");
 *   console.log("Search results:", tasks);
 * } catch (err) {
 *   console.error("Search failed:", err.message);
 * }
 */
export async function searchTasks(query) {
  return http.get(`/api/v1/tasks/search?q=${encodeURIComponent(query)}`);
}