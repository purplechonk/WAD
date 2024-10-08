// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/HomePage.vue';
import Explore from './components/Explore.vue';
import MyEvents from './components/MyEvents.vue';
import Profile from './components/Profile.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home, // Home component will load at the root path
  },
  {
    path: '/explore',
    name: 'Explore',
    component: Explore,
  },
  {
    path: '/my-events',
    name: 'MyEvents',
    component: MyEvents,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
