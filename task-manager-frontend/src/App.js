
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/tasks";

const STATUSES = ["Pending", "Ongoing", "Completed"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchTasks() {
    try {
      const response = await axios.get(API);
      setTasks(response.data);
      setError("");
    } catch (err) {
      setError("Could not fetch tasks. Check your backend connection.");
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function createTask() {
    if (!title.trim()) {
      setError("Task title cannot be empty.");
      setSuccess("");
      return;
    }

    try {
      const response = await axios.post(API, {
        title: title.trim()
      });

      setTasks((current) => [response.data, ...current]);
      setTitle("");
      setError("");
      setSuccess("Task added successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create task.");
      setSuccess("");
    }
  }

  async function updateTaskStatus(id, newStatus) {
    try {
      const response = await axios.patch(`${API}/${id}`, {
        status: newStatus
      });

      setTasks((current) =>
        current.map((task) =>
          task._id === id ? response.data : task
        )
      );

      setError("");
      setSuccess("Task status updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update task.");
      setSuccess("");
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);

      setTasks((current) =>
        current.filter((task) => task._id !== id)
      );

      setError("");
      setSuccess("Task deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete task.");
      setSuccess("");
    }
  }

  return (
    <main className="app-container">

      {/* HEADER */}
      <header className="dashboard-header">
        <p className="eyebrow">PROJECT WORKSPACE</p>
        <h1>Task Manager</h1>
        <p className="subtitle">
          Add tasks, track progress, and manage your project in one place.
        </p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="summary-row">
        {STATUSES.map((status) => (
          <div className={`summary-card ${status.toLowerCase()}`} key={status}>
            <span>{status} Tasks</span>
            <strong>
              {tasks.filter((task) => task.status === status).length}
            </strong>
          </div>
        ))}
      </section>

      {/* NOTIFICATIONS */}
      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}

      {/* ADD TASK */}
      <section className="add-task">
        <label htmlFor="taskTitle">Add a new task</label>

        <div className="input-group">
          <input
            id="taskTitle"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && createTask()
            }
            placeholder="Enter milestone title"
          />

          <button onClick={createTask} className="add-button">
            Add Task
          </button>
        </div>
      </section>

      {/* TASK COLUMNS */}
      <section className="task-board">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter(
            (task) => task.status === status
          );

          return (
            <div
              className={`task-column ${status.toLowerCase()}-column`}
              key={status}
            >
              <div className="column-heading">
                <h2>{status}</h2>
                <span>{columnTasks.length}</span>
              </div>

              {columnTasks.length === 0 ? (
                <p className="empty-state">
                  No tasks in this category.
                </p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onUpdateStatus={updateTaskStatus}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </div>
          );
        })}
      </section>

      <footer className="footer">
        Project Management Dashboard
      </footer>

    </main>
  );
}

// TASK CARD COMPONENT
function TaskCard({ task, onUpdateStatus, onDelete }) {
  return (
    <article className="task-card">

      <h3>{task.title}</h3>

      <p className="task-status">
        Status: {task.status}
      </p>

      <div className="task-actions">

        {task.status === "Pending" && (
          <button
            className="action-button begin"
            onClick={() =>
              onUpdateStatus(task._id, "Ongoing")
            }
          >
            Begin Implementation
          </button>
        )}

        {task.status === "Ongoing" && (
          <>
            <button
              className="action-button pause"
              onClick={() =>
                onUpdateStatus(task._id, "Pending")
              }
            >
              Pause
            </button>

            <button
              className="action-button complete"
              onClick={() =>
                onUpdateStatus(task._id, "Completed")
              }
            >
              Complete
            </button>
          </>
        )}

        {task.status === "Completed" && (
          <button
            className="action-button revise"
            onClick={() =>
              onUpdateStatus(task._id, "Ongoing")
            }
          >
            Revise
          </button>
        )}

        <button
          className="action-button delete"
          onClick={() => onDelete(task._id)}
        >
          Delete
        </button>

      </div>
    </article>
  );
}
