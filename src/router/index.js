import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

// this silences the uncaught (in promise) undefined console error when redirecting inside nav guard
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch((err) => err);
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/leads',
    name: 'Leads',
    component: () => import(/* webpackChunkName: "leads" */ '../views/Leads.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      requiresAuth: false,
    },
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import(/* webpackChunkName: "monitor" */ '../views/Monitor.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  // ---------- CLEANUP ------------

  // 404
  {
    path: '/404',
    meta: {
      title: 'Marketing.Ruoff.com | 404 - Not Found',
      requiresAuth: false,
    },
    component: () => import(/* webpackChunkName: "404" */ '../views/404.vue'),
  },

  // CATCH ALL
  {
    path: '*',
    meta: {
      title: 'Marketing.Ruoff.com | 404 - Page Not Found',
      requiresAuth: false,
    },
    redirect: '/404',
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('wlv4');
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (token) {
      if (store.state.userIsValidated == false) {
        store.dispatch('validateToken', token).then(() => {
          // handle home page redirect based on role
          if (to.path == '/') {
            if (store.state.userProfile.session.isAdmin == false) {
              next('/leads');
            } else {
              next('/monitor');
            }
          }
          // guard the leads page against admins
          if (to.path == '/leads') {
            if (store.state.userProfile.session.isAdmin == true) {
              next('/monitor');
            }
          }
          // guard the monitor page against non-admins
          if (to.path == '/monitor') {
            if (store.state.userProfile.session.isAdmin == false) {
              next('/leads');
            }
          }
          next();
        }).catch(() => {
          next('/login');
        });
      } else {
        next();
      }
    } else {
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
