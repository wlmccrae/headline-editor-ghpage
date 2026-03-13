import { createContext, useContext, useState, useEffect } from 'react';

const DyslexiaContext = createContext();

export function DyslexiaProvider({ children }) {
    const [dyslexiaMode, setDyslexiaMode] = useState(() => {
        const stored = localStorage.getItem('dyslexiaMode') === 'true';
        if (stored) document.body.classList.add('dyslexia-mode');
        return stored;
    });

    useEffect(() => {
        localStorage.setItem('dyslexiaMode', dyslexiaMode);
        if (dyslexiaMode) {
            document.body.classList.add('dyslexia-mode');
        } else {
            document.body.classList.remove('dyslexia-mode');
        }
    }, [dyslexiaMode]);

    return (
        <DyslexiaContext.Provider value={{ dyslexiaMode, setDyslexiaMode }}>
            {children}
        </DyslexiaContext.Provider>
    );
}

export function useDyslexia() {
    return useContext(DyslexiaContext);
}
