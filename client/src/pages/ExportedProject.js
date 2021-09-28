import React, { useEffect, useState } from 'react';
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

      setProject(data);
      setLoading(false);
    };

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
    //eslint-disable-next-line
  }, [project]);

  return (
    <Col className='exported-wrapper'>
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
          <Row style={{ marginBottom: '15px' }}>
            <Button
              variant='outline-success'
              href={project.exportedUrl}
              download=''
            >
              Download
            </Button>
          </Row>
          <Row>
            <video
              src={project.exportedUrl}
              controls
              style={{
                width: '50vw',
                minWidth: '325px',
                maxHeight: '500px',
                maxWidth: '750px',
              }}
              className='border'
            />
          </Row>
          <Row
            style={{ minWidth: '325px', maxWidth: '50vw', marginTop: '50px' }}
            className='border'
          >
            {json &&
              json.map((x, i) => {
                return (
                  <div
                    style={{
                      padding: 0,
                    }}
                    key={i}
                    className='border'
                  >
                    <div style={{ height: '25px' }} />
                    {x.alternatives &&
                      x.alternatives[0].words &&
                      x.alternatives[0].words.map((z, i) => {
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
