import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const TaskDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    
    const [deletingTask, setDeletingTask] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { showToast } = useToast();

    const fetchTasks = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getTasks();
            setTasks(res.data);
        } catch (err) {
            setError(err.message || 'Unable to load tasks.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateTask = async (taskData) => {
        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const tempTask = { ...taskData, _id: tempId, createdAt: new Date().toISOString() };
        
        setTasks(prev => [tempTask, ...prev]);
        setIsSubmitting(true);
        
        try {
            const res = await createTask(taskData);
            // Replace temp task with real task
            setTasks(prev => prev.map(t => t._id === tempId ? res.data : t));
            showToast('Task created successfully', 'success');
        } catch (err) {
            // Revert optimistic update
            setTasks(prev => prev.filter(t => t._id !== tempId));
            showToast(err.message || 'Failed to create task', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTask = async (taskData) => {
        setIsSubmitting(true);
        try {
            const res = await updateTask(editingTask._id, taskData);
            setTasks(prev => prev.map(t => t._id === editingTask._id ? res.data : t));
            setEditingTask(null);
            showToast('Task updated successfully', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to update task', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteTask(deletingTask._id);
            setTasks(prev => prev.filter(t => t._id !== deletingTask._id));
            showToast('Task deleted successfully', 'success');
            setDeletingTask(null);
        } catch (err) {
            showToast(err.message || 'Failed to delete task', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFormSubmit = (taskData) => {
        if (editingTask) {
            handleUpdateTask(taskData);
        } else {
            handleCreateTask(taskData);
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1 className="title" style={{ margin: 0, textAlign: 'left', fontSize: '2rem' }}>Task Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Showing tasks for: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user?.email}</span>
                    </p>
                </div>
            </div>
            
            <TaskForm 
                onSubmit={handleFormSubmit} 
                isSubmitting={isSubmitting} 
                editTask={editingTask}
                onCancelEdit={() => setEditingTask(null)}
            />

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading tasks...</p>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', borderColor: 'var(--danger)' }}>
                    <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
                    <button className="btn btn-outline" onClick={fetchTasks}>Retry</button>
                </div>
            ) : (
                <TaskList 
                    tasks={tasks} 
                    onEdit={setEditingTask} 
                    onDelete={setDeletingTask} 
                    deletingId={isDeleting ? deletingTask?._id : null}
                />
            )}

            <ConfirmDialog 
                isOpen={!!deletingTask}
                title={deletingTask?.title}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingTask(null)}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default TaskDashboard;
