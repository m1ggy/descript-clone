import React, { useState, useEffect } from 'react';
import { Col, Row, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import UserHeader from '../components/UserHeader';
import { useHistory } from 'react-router-dom';
import './currentProject.css';
import { DropZone } from '../components/DropZone';
import useStore from '../store';
import axios from 'axios';
import WaveSurfer from 'wavesurfer.js';
import MediaInfoModal from '../components/MediaInfoModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import useProject from '../hooks/useProject';

function CurrentProject() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState({});
  const [showMedia, setShowMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [oldTS, setOldTS] = useState('');
  const currentProject = useStore((state) => state.currentProject);
  const setCurrentProject = useStore((state) => state.setCurrentProject);
  const [waveSurfer, setWaveSurfer] = useState(null);
  const [files, setFiles] = useState([]);
  const { saveTranscription } = useProject();

  ///wave surfer
  // useEffect(() => {
  //   setWaveSurfer(
  //     WaveSurfer.create({
  //       container: '#waveform',
  //     })
  //   );
  // }, []);

  useEffect(() => {
    if (currentProject) {
      if (currentProject.files) setFiles(currentProject.files.media);
    }
  }, [currentProject]);

  // useEffect(() => {
  //   if (waveSurfer) {
  //     // waveSurfer.load(
  //     //   'https://storage.googleapis.com/project-files-dc/test/test1/[BTCLOD.COM]%20Chill%20Type%20Beat%20_Missing%20You_%20_%20Mellow%20Chill%20Type%20Beat%202020-320k.mp3'
  //     // );

  //     waveSurfer.on('ready', () => {
  //       console.log('audio ready');
  //       toast.success('Player ready', {
  //         theme: 'success',
  //         autoClose: 2000,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //         progress: undefined,
  //         bodyStyle: {
  //           color: 'black',
  //         },
  //       });
  //     });
  //   }
  // }, [waveSurfer]);

  useEffect(() => {
    function getFiles() {
      setLoading(true);
      if (currentProject.files) {
        try {
          axios
            .get(currentProject.files.transcription.link, {
              responseType: 'blob',
            })
            .then(({ data }) => {
              data.text().then((text) => {
                setTranscription(text);
                setOldTS(text);
              });
            });
        } catch (e) {
          console.log(e.response);
        }
      }
      setLoading(false);
    }

    if (currentProject.files) {
      getFiles();
    }
  }, [currentProject.files]);

  return (
    <Row>
      <Col lg={2} xs={0}></Col>
      <Col>
        <ToastContainer
          position='bottom-center'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <MediaInfoModal
          selectedMedia={selectedMedia}
          show={showMedia}
          setShow={setShowMedia}
          id={currentProject._id}
        />
        <Row className='project-header'>
          <UserHeader />
          <h1>{currentProject.projectName}</h1>
        </Row>
        <Row>
          <Button
            onClick={() => {
              history.goBack();
              setCurrentProject({});
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
                      <h6>Main Transcription</h6>
                    </ListGroup.Item>
                    <ListGroup.Item
                      action
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => {
                        setSelectedMedia(currentProject.files.transcription);
                        setShowMedia(true);
                      }}
                    >
                      Transcription File
                    </ListGroup.Item>
                  </ListGroup>
                </Row>
                <Row>
                  <ListGroup>
                    <ListGroup.Item
                      variant='info'
                      style={{ textAlign: 'center' }}
                    >
                      <h6>Media File</h6>
                    </ListGroup.Item>
                    {files &&
                      files.map((x) => {
                        return (
                          <ListGroup.Item
                            action
                            key={x.url}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                            onClick={() => {
                              setSelectedMedia(x);
                              setShowMedia(true);
                            }}
                          >
                            {x.name.length > 15
                              ? x.name.slice(0, 15) +
                                '...' +
                                x.name.split('.')[x.name.split('.').length - 1]
                              : x.name}{' '}
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: 'fit-content',
                    flexDirection: 'column',
                  }}
                >
                  <pre className='text-warning'>
                    {' '}
                    {oldTS !== transcription && 'Changes made.'}
                  </pre>
                  <div>
                    <Button
                      size='sm'
                      variant='outline-success'
                      style={{ width: 'fit-content', marginBottom: '15px' }}
                      onClick={() => {
                        setSaving(true);
                        toast
                          .promise(
                            saveTranscription(
                              currentProject._id,
                              transcription
                            ),
                            {
                              pending: 'Saving changes ....',
                              success: 'Changes saved.',
                              rejection: 'Failed to save changes.',
                            }
                          )
                          .then(() => {
                            setSaving(false);
                          });
                      }}
                      disabled={oldTS === transcription || saving}
                    >
                      {saving ? (
                        <Spinner animation='border' size='sm' />
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline-warning'
                      style={{
                        width: 'fit-content',
                        marginBottom: '15px',
                        marginLeft: '10px ',
                      }}
                      onClick={() => {
                        setTranscription(oldTS);
                        toast.warn('Undo', {
                          autoClose: 1500,
                        });
                      }}
                      disabled={oldTS === transcription || saving}
                    >
                      Undo
                    </Button>
                  </div>
                </div>
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
                {files && !files.length && (
                  <>
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
                  </>
                )}
              </Row>
              <Row></Row>
            </Col>
          </Row>
        )}
        <div id='waveform'></div>
        <div id='waveform-timeline'></div>
      </Col>
      <Col lg={2} xs={0}></Col>
    </Row>
  );
}

export default CurrentProject;
