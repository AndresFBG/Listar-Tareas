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
export async function registerUser({ username, lastname, birthdate, email, password, bio }) {
  return http.post('/api/v1/users', { username, lastname, birthdate, email, password, bio });
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
export async function updateUserProfile({ id, username, lastname, email, birthdate, bio }) {
  return http.put(`/api/v1/users/${id}`, { username, lastname, email, birthdate, bio });
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
  return http.del(`/api/v1/tasks/${taskId}`);
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
 * Request password recovery for a user
 * @param {Object} params - Recovery data
 * @param {string} params.email - User email to send recovery link
 * @returns {Promise<Object>} Recovery confirmation
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   await recoverPassword({ email: "user@example.com" });
 *   console.log("Recovery email sent");
 * } catch (err) {
 *   console.error("Recovery failed:", err.message);
 * }
 */
export async function recoverPassword({ email }) {
  return http.post('/api/v1/auth/recover-password', { email });
}

/**
 * Reset password with a valid token
 * @param {Object} params - Reset data
 * @param {string} params.token - Recovery token from email
 * @param {string} params.newPassword - New password
 * @returns {Promise<Object>} Password reset confirmation
 * @throws {Error} If the API responds with an error status or message.
 * 
 * @example
 * try {
 *   await resetPassword({ token: "reset-token", newPassword: "newPassword123" });
 *   console.log("Password reset successfully");
 * } catch (err) {
 *   console.error("Password reset failed:", err.message);
 * }
 */
export async function resetPassword({ token, newPassword }) {
  return http.post('/api/v1/auth/reset-password', { token, newPassword });
}