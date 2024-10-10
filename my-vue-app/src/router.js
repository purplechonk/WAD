// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/HomePage.vue';
import Explore from './components/Explore.vue'; // Accessible to all
import MyEvents from './components/MyEvents.vue'; // Protected route
import Profile from './components/Profile.vue'; // Protected route
import Login from './components/Login.vue'; // Login page

import { isAuthenticated } from './composables/auth'; // Import the auth check function

// Define your routes
const routes = [
  { path: '/', component: Home, name: 'Home' }, // Home page is accessible to everyone
  { path: '/explore', component: Explore, name: 'Explore' }, // Explore page is accessible to everyone
  { path: '/my-events', component: MyEvents, name: 'MyEvents', meta: { requiresAuth: true } }, // Protected route
  { path: '/profile', component: Profile, name: 'Profile', meta: { requiresAuth: true } }, // Protected route
  { path: '/login', component: Login, name: 'Login' }, // Login page
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication and handle redirects
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth); // Check if the route requires auth

  // Redirect to the login page with the current path as the "redirect" query parameter
  if (requiresAuth && !isAuthenticated()) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next(); // Allow navigation if no auth is required or the user is authenticated
  }
});

export default router;
