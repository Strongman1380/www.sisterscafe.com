// Configuration for different environments
const config = {
  development: {
    // Always use Sisters Cafe development server for API calls
    API_BASE_URL: 'http://localhost:3001',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51RpthwFwMQSBzM6V7FLAcm1EIcBP2ygsvRHWCVskbpDlX5AK0QWnbL5nHoCWYQV7KA4DQUVcLhsQpAVv150y9XHs00IkXAQLMj'
  },
  production: {
    API_BASE_URL: '', // Empty string means same domain (Vercel will handle this)
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51RpthwFwMQSBzM6V7FLAcm1EIcBP2ygsvRHWCVskbpDlX5AK0QWnbL5nHoCWYQV7KA4DQUVcLhsQpAVv150y9XHs00IkXAQLMj'
  }
};

// Detect environment - if localhost or 127.0.0.1, use development config
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '5500' || // Live Server
                     window.location.port === '3000' || // React dev server
                     window.location.port === '3001';   // Sisters Cafe dev server

const currentConfig = isDevelopment ? config.development : config.production;

// Debug logging
console.log('🔧 Sisters Cafe Config:', {
  hostname: window.location.hostname,
  port: window.location.port,
  fullURL: window.location.href,
  isDevelopment: isDevelopment,
  API_BASE_URL: currentConfig.API_BASE_URL
});

// Export for use in other files
window.APP_CONFIG = currentConfig;