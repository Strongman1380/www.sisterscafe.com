// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000', // Vercel dev server
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51RpthwFwMQSBzM6V7FLAcm1EIcBP2ygsvRHWCVskbpDlX5AK0QWnbL5nHoCWYQV7KA4DQUVcLhsQpAVv150y9XHs00IkXAQLMj'
  },
  production: {
    API_BASE_URL: '', // Empty string means same domain (Vercel will handle this)
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51RpthwFwMQSBzM6V7FLAcm1EIcBP2ygsvRHWCVskbpDlX5AK0QWnbL5nHoCWYQV7KA4DQUVcLhsQpAVv150y9XHs00IkXAQLMj'
  }
};

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const currentConfig = isDevelopment ? config.development : config.production;

// Export for use in other files
window.APP_CONFIG = currentConfig;