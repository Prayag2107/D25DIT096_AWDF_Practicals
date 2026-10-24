import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X, Sparkles, Loader2, AlertCircle, Info } from 'lucide-react';
import { generateTaskDescription } from '../api/api';

const TaskForm = ({ onSubmit, isSubmitting, editTask, onCancelEdit }) => {
    const [task, setTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        completed: false
    });

    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [hasAiGenerated, setHasAiGenerated] = useState(false);

    useEffect(() => {
        if (editTask) {
            setTask(editTask);
            setHasAiGenerated(false);
            setAiError('');
        }
    }, [editTask]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError('');
        if (name === 'description' && hasAiGenerated) {
            // User edited the AI suggestion
        }
    };

    /**
     * AI-Powered Task Description Generation Handler
     */
    const handleGenerateAiDescription = async () => {
        // Step 6.1 & 6.2: Read task title and validate presence
        const currentTitle = task.title ? task.title.trim() : '';
        if (!currentTitle) {
            setError('Please enter a task title first to generate an AI description.');
            return;
        }

        // Step 6.3: Display loading indicator and prevent repeated clicks
        setAiLoading(true);
        setAiError('');
        setError('');

        try {
            // Step 6.4 & 6.5: Call backend AI endpoint with existing auth token
            const data = await generateTaskDescription(currentTitle);

            // Step 6.6 & 6.7: Parse JSON response and populate description field
            if (data && data.description) {
                setTask(prev => ({
                    ...prev,
                    description: data.description
                }));
                setHasAiGenerated(true);
            } else if (data && data.fallback) {
                // Graceful fallback response
                setAiError(data.message || 'AI suggestions are temporarily unavailable. Please enter your description manually.');
            }
        } catch (err) {
            // Step 6.10: Show helpful error message if generation fails
            console.warn('[AI Generation Failure]', err.message);
            setAiError(err.message || 'AI suggestions are temporarily unavailable. Please enter your description manually.');
        } finally {
            // Step 6.11: Restore button after request completes
            setAiLoading(false);
        }
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
            setHasAiGenerated(false);
            setAiError('');
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
                <label className="form-label" htmlFor="task-title-input">Task Title</label>
                <input 
                    id="task-title-input"
                    type="text" 
                    name="title" 
                    value={task.title} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="E.g., Complete Practical 13"
                    disabled={isSubmitting}
                />
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" htmlFor="task-description-input" style={{ marginBottom: 0 }}>
                        Description
                    </label>
                    {/* Step 6: Generate description with AI button */}
                    <button
                        id="generate-ai-desc-btn"
                        type="button"
                        onClick={handleGenerateAiDescription}
                        disabled={aiLoading || !task.title.trim()}
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: (aiLoading || !task.title.trim()) ? 'not-allowed' : 'pointer',
                            opacity: (aiLoading || !task.title.trim()) ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)'
                        }}
                        title={!task.title.trim() ? 'Enter a task title first' : 'Generate description with AI'}
                    >
                        {aiLoading ? (
                            <>
                                <Loader2 size={14} className="spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} />
                                <span>Generate description with AI</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Step 6.8 & 6.9: Description textarea remains fully editable */}
                <textarea 
                    id="task-description-input"
                    name="description" 
                    value={task.description} 
                    onChange={handleChange} 
                    className="form-input" 
                    rows="3"
                    placeholder="Describe task details, or click 'Generate description with AI' based on title"
                    disabled={isSubmitting}
                />

                {/* Step 6.10: Graceful error indicator */}
                {aiError && (
                    <div 
                        id="ai-error-banner"
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#fca5a5',
                            fontSize: '0.8125rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                        <span>{aiError}</span>
                    </div>
                )}

                {/* Step 7: Responsible AI Disclaimer */}
                <div 
                    id="ai-disclaimer"
                    style={{
                        marginTop: '0.4rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.4rem',
                        color: hasAiGenerated ? '#c084fc' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontStyle: 'italic',
                        lineHeight: 1.4
                    }}
                >
                    <Info size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                        {hasAiGenerated && <strong style={{ fontStyle: 'normal' }}>✨ AI-suggested: </strong>}
                        AI-generated suggestion: review and edit this content before saving. Generated content may be incomplete or inaccurate.
                    </span>
                </div>
            </div>

            <div className="flex-gap" style={{ alignItems: 'flex-start' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="task-priority-select">Priority</label>
                    <select 
                        id="task-priority-select"
                        name="priority" 
                        value={task.priority} 
                        onChange={handleChange} 
                        className="form-select"
                        disabled={isSubmitting}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                
                <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'center', height: '100%', marginTop: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                            id="task-completed-checkbox"
                            type="checkbox" 
                            name="completed" 
                            checked={task.completed} 
                            onChange={handleChange} 
                            style={{ width: '1rem', height: '1rem' }}
                            disabled={isSubmitting}
                        />
                        Completed
                    </label>
                </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <button 
                    id="submit-task-btn"
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting}
                    style={{ flex: 1 }}
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
                {editTask && (
                    <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={onCancelEdit}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default TaskForm;
