const config = {
    // Use environment variable if available, otherwise use local development URL
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000'
};

export default config; 