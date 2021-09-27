import axios from 'axios';
import useStore from '../store';
import { baseurl } from '../constants';
import { useHistory } from 'react-router-dom';
const useExport = () => {
  const currentProject = useStore((state) => state.currentProject);
  const token = localStorage.getItem('accessToken');
  const setLoading = useStore((state) => state.setLoading);

  const history = useHistory();
  async function exportProject() {
    try {
      setLoading(true);

      await axios.get(`${baseurl}/export/${currentProject._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      history.push(`/projects/${currentProject._id}/exported`);

      setLoading(false);
      return new Promise((res, rej) => res());
    } catch {
      setLoading(false);
      return new Promise((res, rej) => rej());
    }
  }

  async function getExportedProject(id) {
    try {
      const { data } = await axios.get(`${baseurl}/export/${id}/exported`);

      return new Promise((res) => res(data.project));
    } catch {
      return false;
    }
  }

  async function getJson(url) {
    try {
      const { data } = await axios.get(url);

      return new Promise((res) => res(data));
    } catch {
      return false;
    }
  }

  return {
    exportProject,
    getExportedProject,
    getJson,
  };
};

export default useExport;
