import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './services/todoService';
import { ToastContainer, ConfirmDialog } from './components/Toast';

/**
 * Main App Component
 * 
 * Manages TODO list state and handles:
 * - Fetching todos on component mount
 * - Creating new todos via form submission
 * - Displaying todos, loading states, and error messages
 */
function App() {
  // State management using React hooks
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todoDescription, setTodoDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    todoId: null,
  });

  /**
   * Fetches todos from the backend API
   * Called on component mount and after successful todo creation
   */
  const loadTodos = async () => {
    setLoading(true);
    setError(null);

    const response = await fetchTodos();

    if (response.success) {
      setTodos(response.data || []);
    } else {
      setError(response.error || 'Failed to load todos');
    }

    setLoading(false);
  };

  /**
   * Effect hook to fetch todos when component mounts
   * Empty dependency array ensures this runs only once on mount
   */
  useEffect(() => {
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles form submission to create a new todo
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset submit error
    setSubmitError(null);

    // Validate input
    const trimmedDescription = todoDescription.trim();
    if (!trimmedDescription) {
      setSubmitError('Please enter a todo description');
      return;
    }

    setSubmitting(true);

    // Create todo via API
    const response = await createTodo(trimmedDescription);

    if (response.success) {
      // Clear form on success
      setTodoDescription('');
      showToast('Todo created successfully!', 'success');
      
      // Refresh the todo list to show the new todo
      await loadTodos();
    } else {
      const errorMsg = response.error || 'Failed to create todo';
      setSubmitError(errorMsg);
      showToast(errorMsg, 'error');
    }

    setSubmitting(false);
  };

  /**
   * Handles input field changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    setTodoDescription(e.target.value);
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  /**
   * Starts editing a todo
   * @param {Object} todo - The todo item to edit
   */
  const handleEditStart = (todo) => {
    setEditingId(todo._id);
    setEditValue(todo.description);
  };

  /**
   * Cancels editing
   */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  /**
   * Handles updating a todo
   * @param {string} todoId - The todo ID to update
   */
  const handleUpdate = async (todoId) => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      return;
    }

    setUpdating(true);

    const response = await updateTodo(todoId, trimmedValue);

    if (response.success) {
      setEditingId(null);
      setEditValue('');
      showToast('Todo updated successfully!', 'success');
      // Refresh the todo list
      await loadTodos();
    } else {
      const errorMsg = response.error || 'Failed to update todo';
      showToast(errorMsg, 'error');
    }

    setUpdating(false);
  };

  /**
   * Shows confirmation dialog for deletion
   * @param {string} todoId - The todo ID to delete
   */
  const handleDeleteClick = (todoId) => {
    const todo = todos.find(t => t._id === todoId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Todo',
      message: `Are you sure you want to delete "${todo?.description || 'this todo'}"? This will permanently remove it from your list.`,
      onConfirm: () => handleDelete(todoId),
      todoId: todoId,
    });
  };

  /**
   * Handles deleting a todo
   * @param {string} todoId - The todo ID to delete
   */
  const handleDelete = async (todoId) => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
    setDeletingId(todoId);

    const response = await deleteTodo(todoId);

    if (response.success) {
      showToast('Todo deleted successfully', 'success');
      // Refresh the todo list
      await loadTodos();
    } else {
      showToast(response.error || 'Failed to delete todo', 'error');
    }

    setDeletingId(null);
  };

  /**
   * Shows a toast notification
   * @param {string} message - The message to display
   * @param {string} type - The type of toast (success, error, info)
   * @param {number} duration - Duration in milliseconds
   */
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  /**
   * Removes a toast notification
   * @param {number} id - The toast ID
   */
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="App">
      <div className="app-container">
        {/* Header */}
        <div className="app-header">
          <h1>✨ Todo App</h1>
          <p>Stay organized and get things done</p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="main-content">
          {/* Left Side - Add Todo Form (Smaller) */}
          <div className="left-panel">
            <div className="card">
              <div className="card-header">
                <h2>Add New Todo</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="todo-form">
                <div className="form-group">
                  <label htmlFor="todo" className="form-label">
                    What needs to be done?
                  </label>
                  <input
                    type="text"
                    id="todo"
                    className="form-input"
                    value={todoDescription}
                    onChange={handleInputChange}
                    disabled={submitting}
                    placeholder="Enter your todo description..."
                    autoFocus
                  />
                </div>
                
                {submitError && (
                  <div className="form-error">
                    {submitError}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting || !todoDescription.trim()}
                >
                  {submitting ? (
                    <>
                      <span>⏳</span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      Add Todo
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Todo List (Bigger) */}
          <div className="right-panel">
            <div className="card">
              <div className="card-header">
                <h2>Your Todos</h2>
              </div>
              
              <div className="todo-list-container">
                {loading && (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading your todos...</p>
                  </div>
                )}
                
                {error && (
                  <div className="error-container">
                    <div className="error-message">
                      {error}
                    </div>
                    <button 
                      className="btn-retry"
                      onClick={loadTodos}
                    >
                      Retry
                    </button>
                  </div>
                )}
                
                {!loading && !error && todos.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <p className="empty-state-text">No todos yet. Create your first todo on the left!</p>
                  </div>
                )}
                
                {!loading && !error && todos.length > 0 && (
                  <ul className="todo-list">
                    {todos.map((todo) => (
                      <li key={todo._id} className="todo-item">
                        {editingId === todo._id ? (
                          // Edit mode
                          <div className="todo-edit-container">
                            <input
                              type="text"
                              className="form-input todo-edit-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              disabled={updating}
                              autoFocus
                            />
                            <div className="todo-actions">
                              <button
                                className="btn btn-save"
                                onClick={() => handleUpdate(todo._id)}
                                disabled={updating || !editValue.trim()}
                              >
                                {updating ? 'Saving...' : '✓ Save'}
                              </button>
                              <button
                                className="btn btn-cancel"
                                onClick={handleEditCancel}
                                disabled={updating}
                              >
                                ✕ Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <div className="todo-item-content">
                              {todo.description}
                            </div>
                            <div className="todo-item-meta">
                              {todo.created_at && (
                                <div className="todo-item-date">
                                  {formatDate(todo.created_at)}
                                </div>
                              )}
                              <div className="todo-item-actions">
                                <button
                                  className="btn-icon btn-edit"
                                  onClick={() => handleEditStart(todo)}
                                  title="Edit todo"
                                  disabled={deletingId === todo._id}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn-icon btn-delete"
                                  onClick={() => handleDeleteClick(todo._id)}
                                  title="Delete todo"
                                  disabled={deletingId === todo._id || editingId !== null}
                                >
                                  {deletingId === todo._id ? '⏳' : '🗑️'}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default App;
