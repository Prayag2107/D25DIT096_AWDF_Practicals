import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

// Practical 8 Step 6: Lazy load the heavy visualization component
const TaskAnalytics = lazy(() => import('../components/TaskAnalytics'));

const TaskDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    
    const [deletingTask, setDeletingTask] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toggle for Step 6 heavy component lazy loading
    const [showAnalytics, setShowAnalytics] = useState(false);

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

    // Step 9: Stabilize callback handlers with useCallback to avoid unnecessary re-renders in TaskItem
    const handleSetEditing = useCallback((task) => {
        setEditingTask(task);
    }, []);

    const handleSetDeleting = useCallback((task) => {
        setDeletingTask(task);
    }, []);

    return (
        <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="title" style={{ margin: 0, textAlign: 'left', fontSize: '2rem' }}>Task Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Showing tasks for: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user?.email}</span>
                    </p>
                </div>

                {/* Step 6 Trigger: On-demand heavy component lazy loading */}
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowAnalytics((prev) => !prev)}
                    style={{ fontSize: '0.85rem' }}
                >
                    <BarChart3 size={16} />
                    <span>{showAnalytics ? 'Hide Analytics' : 'View Task Analytics'}</span>
                    {showAnalytics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* Lazy-loaded heavy TaskAnalytics component wrapped in Suspense */}
            {showAnalytics && (
                <Suspense
                    fallback={
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner" style={{ margin: '0 auto 0.75rem', width: '28px', height: '28px' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Downloading TaskAnalytics chunk on demand...
                            </p>
                        </div>
                    }
                >
                    <TaskAnalytics tasks={tasks} />
                </Suspense>
            )}
            
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
                    onEdit={handleSetEditing} 
                    onDelete={handleSetDeleting} 
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
