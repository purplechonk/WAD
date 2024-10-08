// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/HomePage.vue';
import Explore from './components/Explore.vue'; // Accessible to all
import MyEvents from './components/MyEvents.vue'; // Protected route
import Profile from './components/Profile.vue'; // Protected route
import Login from './components/Login.vue'; // Login page

// Define your routes
const routes = [
  { path: '/', component: Home }, // Home page is accessible to everyone
  { path: '/explore', component: Explore }, // Explore page is accessible to everyone
  { path: '/my-events', component: MyEvents }, // Protected route
  { path: '/profile', component: Profile }, // Protected route
  { path: '/login', component: Login }, // Login page
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to redirect to login if user tries to access protected routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = false; // Replace with your actual authentication check

  if (
    (to.path === '/my-events' || to.path === '/profile') && 
    !isAuthenticated
  ) {
    // If the user is not authenticated and tries to access a protected route, redirect to login
    next('/login');
  } else {
    next(); // Allow the navigation
  }
});

export default router;
