/**
 * Todo Service
 * 
 * Handles all API communication for TODO operations.
 * Provides a clean abstraction layer between components and the backend API.
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Fetches all todos from the backend API
 * @returns {Promise<Object>} Response object with success status and data/error
 */
export const fetchTodos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle HTTP error responses
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
        data: null,
      };
    }

    return {
      success: data.success !== false,
      data: data.data || [],
      error: data.error || null,
    };
  } catch (error) {
    // Handle network errors or other exceptions
    return {
      success: false,
      error: error.message || 'Failed to fetch todos. Please check your connection.',
      data: null,
    };
  }
};

/**
 * Creates a new todo item
 * @param {string} description - The todo description
 * @returns {Promise<Object>} Response object with success status and data/error
 */
export const createTodo = async (description) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: description.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle HTTP error responses
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
        data: null,
      };
    }

    return {
      success: data.success !== false,
      data: data.data || null,
      error: data.error || null,
    };
  } catch (error) {
    // Handle network errors or other exceptions
    return {
      success: false,
      error: error.message || 'Failed to create todo. Please check your connection.',
      data: null,
    };
  }
};

/**
 * Updates an existing todo item
 * @param {string} todoId - The todo ID
 * @param {string} description - The updated todo description
 * @returns {Promise<Object>} Response object with success status and data/error
 */
export const updateTodo = async (todoId, description) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: description.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle HTTP error responses
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
        data: null,
      };
    }

    return {
      success: data.success !== false,
      data: data.data || null,
      error: data.error || null,
    };
  } catch (error) {
    // Handle network errors or other exceptions
    return {
      success: false,
      error: error.message || 'Failed to update todo. Please check your connection.',
      data: null,
    };
  }
};

/**
 * Deletes a todo item
 * @param {string} todoId - The todo ID
 * @returns {Promise<Object>} Response object with success status and error
 */
export const deleteTodo = async (todoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle HTTP error responses
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: data.success !== false,
      error: data.error || null,
    };
  } catch (error) {
    // Handle network errors or other exceptions
    return {
      success: false,
      error: error.message || 'Failed to delete todo. Please check your connection.',
    };
  }
};

