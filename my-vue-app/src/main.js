import { createApp } from 'vue'
import App from './App.vue';
import router from './router'; // Import the router

// Import Bootstrap, Font Awesome, and Custom Styles
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/css/bootstrap.css';
import './assets/css/font-awesome.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './assets/css/styles.css';
import 'animate.css' 

// // Import Bootstrap JS

const app = createApp(App);
window.CURRENT_DATE = new Date('2024-02-01T00:00:00');

// Import Google Fonts via JavaScript
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap';
document.head.appendChild(link);

// Use the router
app.use(router);

// Mount the app
app.mount('#app');
