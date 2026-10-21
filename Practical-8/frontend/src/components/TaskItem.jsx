import React from 'react';
import { Pencil, Trash2, Calendar, Clock } from 'lucide-react';

const TaskItem = React.memo(({ task, onEdit, onDelete, isDeleting }) => {
    const isTemp = task._id.startsWith('temp-');

    return (
        <div className={`card ${task.completed ? 'task-completed' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
            {isTemp && (
                <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: '4px', backgroundColor: 'var(--primary)', opacity: 0.5, animation: 'pulse 2s infinite' }}></div>
            )}
            
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <h4 className="task-title" style={{ margin: 0, fontSize: '1.25rem', color: isTemp ? 'var(--text-muted)' : 'inherit' }}>
                    {task.title}
                </h4>
                <div className="flex-gap">
                    <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                    </span>
                </div>
            </div>
            
            {task.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                    {task.description}
                </p>
            )}
            
            <div className="flex-between" style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div className="flex-gap" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {isTemp ? (
                        <><Clock size={14} /> Pending...</>
                    ) : (
                        <><Calendar size={14} /> {new Date(task.createdAt).toLocaleDateString()}</>
                    )}
                </div>
                
                <div className="flex-gap">
                    <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.35rem' }} 
                        onClick={() => onEdit(task)}
                        disabled={isTemp || isDeleting}
                        title="Edit"
                    >
                        <Pencil size={16} />
                    </button>
                    <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.35rem' }} 
                        onClick={() => onDelete(task)}
                        disabled={isTemp || isDeleting}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;

