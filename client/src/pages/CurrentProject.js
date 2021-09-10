import React, { useState, useEffect } from 'react';
import { Col, Row, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaSave, FaUndo, FaArrowLeft, FaFileExport } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';

import { DropZone } from '../components/DropZone';
import UserHeader from '../components/UserHeader';
import useProject from '../hooks/useProject';
import MediaInfoModal from '../components/MediaInfoModal';
import OverlayToolTip from '../components/OverlayToolTip';
import useStore from '../store';

// import WaveSurfer from 'wavesurfer.js';

import './currentProject.css';
import 'react-toastify/dist/ReactToastify.min.css';

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
  // const [waveSurfer, setWaveSurfer] = useState(null);
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

  const saveChanges = () => {
    setSaving(true);
    toast
      .promise(saveTranscription(currentProject._id, transcription), {
        pending: 'Saving changes ....',
        success: 'Changes saved.',
        rejection: 'Failed to save changes.',
      })
      .then(() => {
        setSaving(false);
      });
  };
  const undoChanges = () => {
    setTranscription(oldTS);
    toast.warn('Undo', {
      autoClose: 1500,
    });
  };

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
        <Row style={{ borderBottom: '2px solid black', marginBottom: '10px' }}>
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
            Go back <FaArrowLeft size='1.5em' style={{ marginLeft: '3px' }} />
          </Button>
        </Row>
        {!loading && (
          <Row>
            <Col lg={3} md={'auto'} sm={12}>
              <Row className='m-2'>
                <Row style={{ textAlign: 'center', fontWeight: 'bolder' }}>
                  <h3>Project Files</h3>
                </Row>
                <Row className='mb-5'>
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
                <Row
                  style={{
                    margin: '20px',
                  }}
                ></Row>
              </Row>
            </Col>
            <Col>
              <Row
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                  }

                  if (e.ctrlKey && e.key === 's' && oldTS !== transcription) {
                    e.preventDefault();
                    saveChanges();
                  } else if (
                    e.ctrlKey &&
                    e.key === 'z' &&
                    oldTS !== transcription
                  ) {
                    e.preventDefault();
                    undoChanges();
                  }
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <h3>Transcription</h3>
                </div>
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
                    {oldTS !== transcription && 'unsaved changes.'}
                  </pre>
                  <div
                    style={{
                      borderBottom: '1px solid black',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 'max-content',
                      padding: '10px',
                      margin: '5px',
                      width: '100%',
                    }}
                  >
                    <OverlayToolTip
                      content={
                        <div style={{ margin: '5px' }}>
                          <p>Save changes to server.</p>
                          <small>Save Shortcut Key</small>
                          <br />
                          <br />
                          <kbd>Ctrl</kbd> + <kbd>S</kbd>
                        </div>
                      }
                      placement='top'
                    >
                      <Button
                        size='sm'
                        variant='success'
                        style={{ width: 'fit-content' }}
                        onClick={saveChanges}
                        disabled={oldTS === transcription || saving}
                      >
                        {saving ? (
                          <Spinner animation='border' size='sm' />
                        ) : (
                          <>
                            Save{' '}
                            <FaSave size='2em' style={{ marginLeft: '3px' }} />
                          </>
                        )}
                      </Button>
                    </OverlayToolTip>
                    <OverlayToolTip
                      content={
                        <div style={{ margin: '5px' }}>
                          <p>Undo changes.</p>
                          <small>Undo Shortcut Key</small>
                          <br />
                          <br />
                          <kbd>Ctrl</kbd> + <kbd>Z</kbd>
                        </div>
                      }
                      placement='top'
                    >
                      <Button
                        size='sm'
                        variant='warning'
                        style={{
                          width: 'fit-content',

                          marginLeft: '10px ',
                        }}
                        onClick={undoChanges}
                        disabled={oldTS === transcription || saving}
                      >
                        Undo <FaUndo size='2em' style={{ marginLeft: '3px' }} />
                      </Button>
                    </OverlayToolTip>
                    <OverlayToolTip
                      content={
                        <div style={{ margin: '5px' }}>
                          <p>Export current project to the web.</p>
                        </div>
                      }
                      placement='top'
                    >
                      <Button
                        style={{
                          width: 'fit-content',
                          marginLeft: '10px',
                        }}
                        size='sm'
                        variant='info'
                      >
                        Export...{' '}
                        <FaFileExport
                          size='2em'
                          style={{ marginLeft: '3px' }}
                        />
                      </Button>
                    </OverlayToolTip>
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
      </Col>
      <Col lg={2} xs={0}></Col>
    </Row>
  );
}

export default CurrentProject;
