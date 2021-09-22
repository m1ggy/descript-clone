import axios from 'axios';
import useProject from './useProject';
import { baseurl } from '../constants';
const useTranscription = () => {
  const { fetchProject } = useProject();
  /**
   * creates transcription and saves transcription to json file in GCS
   * @param {*} projectName the name of the audio's project
   * @param {*} filename filename of the current audio file
   * @returns void
   */
  async function createTranscription(projectName, filename) {
    const token = localStorage.getItem('accessToken');

    if (token == null) return;

    try {
      const { data } = await axios.post(
        `${baseurl}/transcription`,
        { projectName, filename },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchProject(data.id);
      return new Promise((resolve) => {
        resolve();
      });
    } catch (e) {
      return new Promise((reject) => {
        reject();
      });
    }
  }

  async function fetchTranscription(url) {
    let temp = [];
    try {
      const { data } = await axios.get(url);
      if (data.length) {
        data.forEach((paragraphs) => {
          if (paragraphs.alternatives) {
            temp.push(paragraphs.alternatives[0]);
          } else {
            temp.push(paragraphs);
          }
        });

        return temp;
      }
    } catch (e) {
      return [];
    }
  }

  return {
    createTranscription,
    fetchTranscription,
  };
};

export default useTranscription;
