import axios from 'axios';
import { baseurl } from '../constants';
import useStore from '../store.js';
import { useHistory } from 'react-router-dom';
function useAuth() {
  const setUser = useStore((state) => state.setUser);
  const clearUser = useStore((state) => state.clearUser);
  const history = useHistory();

  async function login({ username, password }) {
    try {
      const res = await axios.post(`${baseurl}/login`, {
        username: username,
        password: password,
      });
      if (res.status === 200) {
        const { token } = res.data;

        setUser({ username, projects: [], globalTime: '' });
        localStorage.setItem('accessToken', token);
        history.push('/projects');
      }
    } catch (e) {
      if (e.response.data) {
        const { message } = e.response.data;
        return { content: message, type: 'danger' };
      }
    }
  }

  async function signup(creds) {
    const { username, password } = creds;
    try {
      const res = await axios.post(`${baseurl}/signup`, {
        username,
        password,
      });
      if (res.status === 200) {
        const { token } = res.data;
        setUser({ username: username, projects: [], globalTime: '' });
        localStorage.setItem('accessToken', token);

        history.push('/projects');
      }
    } catch (e) {
      const { message } = e.response.data;
      console.log(e.response.data);
      return { content: message, type: 'danger' };
    }
  }

  function signout() {
    localStorage.clear();
    clearUser();
    history.push('/');
  }

  return {
    login,
    signup,
    signout,
  };
}

export default useAuth;
