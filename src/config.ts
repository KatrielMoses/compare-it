const config = {
    apiUrl: import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? 'http://localhost:3001' : 'https://compare-it-backend.onrender.com')
};

export default config; 