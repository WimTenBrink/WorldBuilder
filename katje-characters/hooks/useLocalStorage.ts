
import React, { useState, useEffect, useCallback } from 'react';

/**
 * A custom React hook that syncs state to local storage and across browser tabs.
 *
 * @template T The type of the state.
 * @param {string} key The key to use in local storage.
 * @param {T | (() => T)} initialValue The initial value or a function to compute it.
 * @param {(storedValue: any) => T} [sanitizer] An optional function to clean/validate data loaded from storage.
 * @param {(value: T) => any} [preSaveTransform] An optional function to transform the value before saving it to localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A stateful value and a function to update it.
 */
export function useLocalStorage<T>(
    key: string, 
    initialValue: T | (() => T),
    sanitizer?: (storedValue: any) => T,
    preSaveTransform?: (value: T) => any
): [T, React.Dispatch<React.SetStateAction<T>>] {

    // Helper to read and sanitize value from localStorage.
    // This is called lazily by useState.
    const readValue = useCallback((): T => {
        // Prevent build errors during server-side rendering.
        if (typeof window === 'undefined') {
            return initialValue instanceof Function ? initialValue() : initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                // Sanitize the value from storage if a sanitizer is provided.
                return sanitizer ? sanitizer(parsed) : parsed;
            }
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
        }
        
        // Return initial value if no item, on error, or if we're on the server.
        const value = initialValue instanceof Function ? initialValue() : initialValue;
        // Also sanitize the initial value in case it's a default that needs structure.
        return sanitizer ? sanitizer(value) : value;

    }, [initialValue, key, sanitizer]);

    // State to store our value.
    // Pass a lazy initializer function to useState so this logic is only executed once.
    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Custom setter function that persists to localStorage.
    // Using useCallback to ensure this function is stable and doesn't cause unnecessary re-renders.
    const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
        (value) => {
            // Prevent build errors during server-side rendering.
            if (typeof window === 'undefined') {
                console.warn(`Tried to set localStorage key “${key}” on the server.`);
                return;
            }

            try {
                // Use a function update to get the latest state value.
                setStoredValue((currentValue) => {
                    // Allow value to be a function, just like a normal useState setter.
                    const valueToStore = value instanceof Function ? value(currentValue) : value;
                    
                    // Apply transformation before saving to avoid storing excessively large data.
                    const transformedValue = preSaveTransform ? preSaveTransform(valueToStore) : valueToStore;
                    
                    // Persist the transformed value to local storage.
                    window.localStorage.setItem(key, JSON.stringify(transformedValue));
                    
                    // Return the original, untransformed value to update the in-memory state.
                    return valueToStore;
                });
            } catch (error) {
                console.warn(`Error setting localStorage key “${key}”:`, error);
            }
        },
        [key, preSaveTransform]
    );

    // Effect to listen for changes to the same key from other tabs.
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleStorageChange = (event: StorageEvent) => {
            if (event.storageArea === window.localStorage && event.key === key) {
                try {
                    if (event.newValue) {
                        const parsed = JSON.parse(event.newValue);
                        // Sanitize the value from storage if a sanitizer is provided.
                        setStoredValue(sanitizer ? sanitizer(parsed) : parsed);
                    } else {
                        // Handle case where item is removed/cleared from storage in another tab.
                        setStoredValue(readValue());
                    }
                } catch (error) {
                    console.warn(`Error parsing new value for localStorage key “${key}”:`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, readValue, sanitizer]);

    return [storedValue, setValue];
}
