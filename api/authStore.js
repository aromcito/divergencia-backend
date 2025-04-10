// authStore.js
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref(JSON.parse(localStorage.getItem('user')));
  const token = ref(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.rol === 'admin');

  function setAuthData(responseData) {
    user.value = responseData.user;
    token.value = responseData.token;
    localStorage.setItem('user', JSON.stringify(responseData.user));
    localStorage.setItem('token', responseData.token);
  }

  function clearAuthData() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  async function login(credentials) {
    try {
      const response = await axios.post('/login', credentials);
      setAuthData(response.data);
      router.push(isAdmin.value ? '/admin/dashboard' : '/dashboard');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  return { user, token, isAuthenticated, isAdmin, login, clearAuthData };
});
