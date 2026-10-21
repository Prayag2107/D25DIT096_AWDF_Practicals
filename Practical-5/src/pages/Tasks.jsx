/*
 * Tasks.jsx
 * Practical 4 – RESTful API Integration (Frontend)
 *
 * This page connects to the Express backend (server.js) and
 * performs full CRUD operations on the /tasks REST API:
 *   GET    /tasks        → fetch all tasks
 *   POST   /tasks        → create a new task
 *   PUT    /tasks/:id    → update (toggle completed / edit)
 *   DELETE /tasks/:id    → delete a task
 *
 * Vite's dev-server proxy forwards /tasks requests to localhost:5000.
 */

import { useState, useEffect, useCallback } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const API_URL = '/tasks';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // ─── GET /tasks ────────────────────────────────────────────────
  const fetchTasks = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setTasks(json.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ─── POST /tasks ───────────────────────────────────────────────
  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), description: description.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setTasks((prev) => [...prev, json.data]);
        setTitle('');
        setDescription('');
      })
      .catch((err) => setError(err.message));
  };

  // ─── PUT /tasks/:id  (toggle completed) ────────────────────────
  const toggleComplete = (task) => {
    fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) =>
        setTasks((prev) => prev.map((t) => (t.id === task.id ? json.data : t)))
      )
      .catch((err) => setError(err.message));
  };

  // ─── PUT /tasks/:id  (edit title & description) ────────────────
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim(), description: editDescription.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? json.data : t)));
        cancelEdit();
      })
      .catch((err) => setError(err.message));
  };

  // ─── DELETE /tasks/:id ─────────────────────────────────────────
  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => setTasks((prev) => prev.filter((t) => t.id !== id)))
      .catch((err) => setError(err.message));
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <section>
      <h1>Task Manager</h1>
      <p className="page-subtitle">
        Full CRUD via Express REST API &nbsp;—&nbsp; Practical 4
      </p>

      {/* Create Task Form */}
      <form onSubmit={handleCreate} className="task-form">
        <input
          id="task-title-input"
          type="text"
          className="user-input"
          placeholder="Task title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Task title"
          required
        />
        <input
          id="task-desc-input"
          type="text"
          className="user-input"
          placeholder="Description (optional)…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Task description"
        />
        <button id="create-task-btn" type="submit">➕ Add Task</button>
      </form>

      {/* Loading */}
      {loading && <Spinner />}

      {/* Error */}
      {error && <ErrorMessage message={error} onRetry={fetchTasks} />}

      {/* Task List */}
      {!loading && !error && (
        <>
          <div className="repo-count-bar">
            <h3>Tasks</h3>
            <span className="repo-count-badge">{tasks.length} tasks</span>
          </div>

          {tasks.length === 0 ? (
            <p className="no-repos">
              <span className="emoji">📝</span>
              No tasks yet. Add one above!
            </p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-card ${task.completed ? 'task-completed' : ''}`}
                >
                  {editingId === task.id ? (
                    /* ─── Edit Mode ─── */
                    <div className="task-edit-form">
                      <input
                        type="text"
                        className="user-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        className="user-input"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                      />
                      <div className="task-edit-actions">
                        <button className="save-btn" onClick={() => saveEdit(task.id)}>💾 Save</button>
                        <button className="cancel-btn" onClick={cancelEdit}>✕ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* ─── View Mode ─── */
                    <>
                      <div className="task-header">
                        <label className="task-checkbox-label">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(task)}
                            className="task-checkbox"
                          />
                          <span className={`task-title ${task.completed ? 'done' : ''}`}>
                            {task.title}
                          </span>
                        </label>
                        <span className={`task-status-badge ${task.completed ? 'badge-done' : 'badge-pending'}`}>
                          {task.completed ? '✓ Done' : '● Pending'}
                        </span>
                      </div>

                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}

                      <div className="task-meta">
                        <span className="task-id">ID: {task.id}</span>
                        <span className="task-date">
                          {new Date(task.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="task-actions">
                        <button className="edit-btn" onClick={() => startEdit(task)}>✏️ Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(task.id)}>🗑️ Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default Tasks;
