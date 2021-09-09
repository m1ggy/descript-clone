import React, { useState, useEffect } from 'react';
import { Col, Row, Button, Form, ListGroup } from 'react-bootstrap';
import UserHeader from '../components/UserHeader';
import { useHistory } from 'react-router-dom';
import './currentProject.css';
import { DropZone } from '../components/DropZone';
import useStore from '../store';
import axios from 'axios';
function CurrentProject() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const currentProject = useStore((state) => state.currentProject);

  useEffect(() => {
    async function getFiles() {
      setLoading(true);
      if (currentProject.files) {
        try {
          const res = await axios.get(currentProject.files.transcription.link);
          setTranscription(res.data);
        } catch (e) {
          console.log(e.response.data);
        }
      }
      setLoading(false);
    }
    getFiles();
  }, [currentProject]);
  return (
    <Row>
      <Col lg={2} xs={0}></Col>
      <Col>
        <Row className='project-header'>
          <UserHeader />
          <h1>{currentProject.projectName}</h1>
        </Row>
        <Row>
          <Button
            onClick={() => {
              history.goBack();
            }}
            style={{
              width: 'fit-content',
              marginLeft: '35px',
              marginBottom: '25px',
            }}
          >
            Go back
          </Button>
        </Row>
        {!loading && (
          <Row className='project-content'>
            <Col lg={3} md={'auto'} sm={12}>
              <Row className='m-2'>
                <Row style={{ textAlign: 'center', fontWeight: 'bolder' }}>
                  <h3>Project Files</h3>
                </Row>
                <Row>
                  <ListGroup>
                    <ListGroup.Item
                      variant='info'
                      style={{ textAlign: 'center' }}
                    >
                      <h6>Media Files</h6>
                    </ListGroup.Item>
                    {currentProject !== {} &&
                      currentProject.files.media.map((x) => {
                        return (
                          <ListGroup.Item action key={x.url}>
                            {x.name}
                          </ListGroup.Item>
                        );
                      })}
                  </ListGroup>
                </Row>
              </Row>
            </Col>
            <Col>
              <Row>
                <h3>Transcription</h3>

                <Form.Control
                  value={transcription}
                  onChange={(e) => {
                    setTranscription(e.target.value);
                  }}
                  style={{ minHeight: '150px' }}
                  as='textarea'
                />
              </Row>
              <Row className='mt-5'>
                <h3>Media</h3>
                <DropZone
                  style={{
                    width: '100%',

                    textAlign: 'center',
                    height: '100%',
                  }}
                  className='border'
                  id={currentProject._id}
                />
              </Row>
            </Col>
          </Row>
        )}
      </Col>
      <Col lg={2} xs={0}></Col>
    </Row>
  );
}

export default CurrentProject;
