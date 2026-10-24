import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X } from 'lucide-react';

const TaskForm = ({ onSubmit, isSubmitting, editTask, onCancelEdit }) => {
    const [task, setTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        completed: false
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (editTask) {
            setTask(editTask);
        }
    }, [editTask]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!task.title.trim()) {
            setError('Title is required.');
            return;
        }

        onSubmit(task);
        if (!editTask) {
            setTask({ title: '', description: '', priority: 'medium', completed: false });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{editTask ? 'Edit Task' : 'Add New Task'}</h3>
                {editTask && (
                    <button type="button" className="btn btn-outline" onClick={onCancelEdit} style={{ padding: '0.25rem 0.5rem' }}>
                        <X size={16} />
                    </button>
                )}
            </div>
            
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}
            
            <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                    type="text" 
                    name="title" 
                    value={task.title} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="E.g., Complete Practical 6"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                    name="description" 
                    value={task.description} 
                    onChange={handleChange} 
                    className="form-input" 
                    rows="2"
                    placeholder="Optional details"
                />
            </div>

            <div className="flex-gap" style={{ alignItems: 'flex-start' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Priority</label>
                    <select 
                        name="priority" 
                        value={task.priority} 
                        onChange={handleChange} 
                        className="form-select"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                
                <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'center', height: '100%', marginTop: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            name="completed" 
                            checked={task.completed} 
                            onChange={handleChange} 
                            style={{ width: '1rem', height: '1rem' }}
                        />
                        Completed
                    </label>
                </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting}
                    style={{ width: '100%' }}
                >
                    {isSubmitting ? (
                        <>{editTask ? 'Saving...' : 'Creating...'}</>
                    ) : (
                        <>
                            {editTask ? <Save size={18} /> : <PlusCircle size={18} />}
                            {editTask ? 'Save Changes' : 'Create Task'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default TaskForm;
