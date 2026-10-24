import { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const [isHiding, setIsHiding] = useState(false);

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
        setIsHiding(false);
        
        setTimeout(() => {
            setIsHiding(true);
            setTimeout(() => {
                setToast(null);
                setIsHiding(false);
            }, 300); // Matches animation duration
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type} ${isHiding ? 'hiding' : ''}`}>
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'error' && <AlertCircle size={20} />}
                        {toast.type === 'info' && <Info size={20} />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
