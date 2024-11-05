// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home/HomePage.vue';  // Updated path
import Explore from './components/Events/Explore.vue';  // Updated path
import MyEvents from './components/MyEvents/MyEvents.vue';  // Updated path
import Profile from './components/Profile/Profile.vue';  // Updated path
import Login from './components/Login/Login.vue';  // Updated path
import Analytics from './components/Analytics/Analytics.vue';  // Import the new component

import { isAuthenticated, isAuthStateChecked } from './composables/auth';  // Import the auth check function

// Define your routes
const routes = [
  { path: '/', component: Home, name: 'Home' },  // Home page is accessible to everyone
  { path: '/explore', component: Explore, name: 'Explore' },  // Explore page is accessible to everyone
  { path: '/my-events', component: MyEvents, name: 'MyEvents', meta: { requiresAuth: true } },  // Protected route
  { path: '/analytics', component: Analytics, name: 'Analytics', meta: { requiresAuth: true } }, //Protected route
  { path: '/profile', component: Profile, name: 'Profile', meta: { requiresAuth: true } },  // Protected route
  { path: '/login', component: Login, name: 'Login' },  // Login page
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // If there's a saved position (e.g., when navigating back), use that position
    if (savedPosition) {
      return savedPosition;
    } else {
      // Scroll to top for new route loads
      return { left: 0, top: 0 };
    }
  }
});

// Navigation guard to check authentication and handle redirects
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);  // Check if the route requires auth

  // Wait until auth state is checked before proceeding
  if (!isAuthStateChecked()) {
    const unwatch = setInterval(() => {
      if (isAuthStateChecked()) {
        clearInterval(unwatch);
        if (requiresAuth && !isAuthenticated()) {
          next({ path: '/login', query: { redirect: to.fullPath} });
        } else {
          next();
        }
      }
    }, 100);  // Poll every 100ms to check auth state
  } else if (requiresAuth && !isAuthenticated()) {
    next({ path: '/login', query: { redirect: to.fullPath} });
  } else {
    next();  // Allow navigation if no auth is required or the user is authenticated
  }
});

export default router;
