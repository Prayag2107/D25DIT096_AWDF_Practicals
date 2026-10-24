import React from 'react';

const ConfirmDialog = ({ isOpen, title, onConfirm, onCancel, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 style={{ marginBottom: '1rem' }}>Confirm Deletion</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Are you sure you want to delete "{title}"? This action cannot be undone.
                </p>
                <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
                    <button 
                        className="btn btn-outline" 
                        onClick={onCancel} 
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn-danger" 
                        onClick={onConfirm} 
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
