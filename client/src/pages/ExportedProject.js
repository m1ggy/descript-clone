import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import useExport from '../hooks/useExport';
import { Col, Row, Button, Spinner } from 'react-bootstrap';
import './exportedproject.css';
function ExportedProject() {
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [json, setJson] = useState(null);
  const { id } = useParams();
  const { getExportedProject, getJson } = useExport();
  const history = useHistory();
  useEffect(() => {
    const getProject = async (id) => {
      setLoading(true);
      const data = await getExportedProject(id);
      console.log(data);
      setProject(data);
      setLoading(false);
    };
    console.log(id);
    getProject(id);
    //eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (project === false && history) {
      history.push('/404');
    }
    async function downloadJson() {
      const json = await getJson(project.files.json.url);

      setJson(json);
    }

    if (project) downloadJson();
  }, [project, history, getJson]);

  return (
    <Col className='wrapper'>
      {project && (
        <>
          <Row>
            <h1>{project.projectName}</h1>
          </Row>
          <Row
            style={{
              textAlign: 'center',
            }}
          >
            <pre>by</pre>
            <h4>{project.owner}</h4>
            <pre>{new Date(project.createdAt).toLocaleString('en-US')}</pre>
          </Row>
          <Row>
            <video
              src={project.exportedUrl}
              controls
              style={{ height: '10vw' }}
            />
          </Row>
          <Row className='border'>
            {json &&
              json.map((x, i) => {
                return (
                  <div
                    style={{
                      padding: 0,
                    }}
                  >
                    <div style={{ height: '25px' }} />
                    {x.words &&
                      x.words.map((z, i) => {
                        return (
                          <div
                            key={i}
                            style={{
                              display: 'inline-flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: 'fit-content',
                            }}
                          >
                            {z.word}&nbsp;
                          </div>
                        );
                      })}
                  </div>
                );
              })}
          </Row>
        </>
      )}
      {loading && (
        <>
          <h1>Loading</h1>
          <Spinner animation='border' size='lg' />
        </>
      )}
    </Col>
  );
}

export default ExportedProject;
