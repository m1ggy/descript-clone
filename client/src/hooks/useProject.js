import axios from 'axios';
import { baseurl } from '../constants';
import useStore from '../store';

function useProject() {
  const setProject = useStore((state) => state.setProject);
  const setCurrentProject = useStore((state) => state.setCurrentProject);
  async function createProject(projectName) {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.post(
        `${baseurl}/project/`,
        { projectName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data.message;
    } catch (e) {
      return e.response.message;
    }
  }

  async function deleteProject(projectName) {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.delete(`${baseurl}/project/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: projectName,
        },
      });

      return res.data.message;
    } catch (e) {
      return e.response.message;
    }
  }

  async function getProjects() {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.get(`${baseurl}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProject(res.data.projects);
      return res.data.message;
    } catch (e) {
      return e.response;
    }
  }

  async function fetchProject(id) {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await axios.get(`${baseurl}/project/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentProject(res.data.project);
      return res.data.message;
    } catch (e) {
      console.log(e.response);
      return e.response;
    }
  }

  return {
    createProject,
    deleteProject,
    getProjects,
    fetchProject,
  };
}

export default useProject;
