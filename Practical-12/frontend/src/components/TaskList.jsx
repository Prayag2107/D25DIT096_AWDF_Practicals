import React from 'react';
import TaskItem from './TaskItem';
import { LayoutList } from 'lucide-react';

const TaskList = ({ tasks, onEdit, onDelete, deletingId }) => {
    if (tasks.length === 0) {
        return (
            <div className="empty-state">
                <LayoutList size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>No tasks found.</h3>
                <p style={{ color: 'var(--text-muted)' }}>Create your first task to get started.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {tasks.map(task => (
                <TaskItem 
                    key={task._id} 
                    task={task} 
                    onEdit={onEdit} 
                    onDelete={onDelete}
                    isDeleting={deletingId === task._id}
                />
            ))}
        </div>
    );
};

export default TaskList;
