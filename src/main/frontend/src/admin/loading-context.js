import { createContext, useState, useContext } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const toggleLoading = (state) => {
        setIsLoading(state);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, toggleLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);