import React, { useState, useEffect } from 'react';
import { Col, Row, Button, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaSave,
  FaUndo,
  FaArrowLeft,
  FaFileExport,
  FaCheck,
} from 'react-icons/fa';
import { RiCloseLine } from 'react-icons/ri';
import { CgTranscript } from 'react-icons/cg';

import { DropZone } from '../components/DropZone';
import UserHeader from '../components/UserHeader';
import useProject from '../hooks/useProject';
import useTranscription from '../hooks/useTranscription';
import MediaInfoModal from '../components/MediaInfoModal';
import OverlayToolTip from '../components/OverlayToolTip';
import useStore from '../store';

// import WaveSurfer from 'wavesurfer.js';
import './currentProject.css';
import TranscriptionWord from '../components/TranscriptionWord';

let mediaLength = 0;

function CurrentProject() {
  const history = useHistory();

  const [selectedMedia, setSelectedMedia] = useState({});
  const [showMedia, setShowMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [oldTS, setOldTS] = useState('');
  const currentProject = useStore((state) => state.currentProject);
  const setCurrentProject = useStore((state) => state.setCurrentProject);
  const [rawJson, setRawJson] = useState(null);
  const [parsedJson, setParsedJson] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  // const [waveSurfer, setWaveSurfer] = useState(null);
  const [files, setFiles] = useState([]);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const { saveTranscription } = useProject();
  const { createTranscription } = useTranscription();

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
      if (currentProject.files) {
        if (currentProject.files.json !== {}) {
          setRawJson(currentProject.files.json);
        }
        mediaLength = currentProject.files.media.length;
        setFiles(currentProject.files.media);
      }
    }
  }, [currentProject]);

  ///fetch json data
  useEffect(() => {
    async function fetchJson() {
      setTranscriptionLoading(true);
      let temp = [];
      const { data } = await axios.get(rawJson.url);

      setTranscriptionLoading(false);
      if (data.length) {
        data.forEach((paragraphs) => {
          temp.push(paragraphs.alternatives[0]);
        });
        console.log(temp);

        return setParsedJson(temp);
      }

      setParsedJson([]);
    }

    if (rawJson) {
      fetchJson();
    }
  }, [rawJson]);

  useEffect(() => {
    if (currentProject) {
      if (currentProject.files) setFiles(currentProject.files.media);
    }
    //eslint-disable-next-line
  }, []);

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

  const transcribe = async () => {
    setTranscribing(true);
    await toast.promise(
      createTranscription(
        currentProject.projectName,
        files.filter((x) => x.type.includes('audio'))[0].name
      ),
      {
        success: 'Created Transcription',
        error: 'Failed to create transcription',
        pending: 'Transcribing ...',
      }
    );
    setTranscribing(false);
  };

  return (
    <Row>
      <Col lg={2} xs={0}></Col>
      <Col>
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
              setTranscription('');
              setOldTS('');
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

        <Row>
          <Col lg={3} md={'auto'} sm={12}>
            <Row
              style={{ display: 'flex', justifyContent: 'center' }}
              className='m-2'
            >
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
              <Col>
                <Row
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: 'fit-content',
                    flexDirection: 'column',
                  }}
                >
                  <div>
                    {rawJson ? (
                      <>
                        <pre style={{ margin: 0, color: 'green' }}>
                          Transcribed <FaCheck />
                        </pre>
                      </>
                    ) : mediaLength > 0 ? (
                      <>
                        {transcribing ? (
                          <pre>Transcribing ...</pre>
                        ) : (
                          <>
                            <pre style={{ margin: 0, color: 'red' }}>
                              Not transcribed <RiCloseLine />
                            </pre>
                            <pre
                              style={{
                                margin: 0,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                              }}
                              onClick={transcribe}
                            >
                              Transcribe now <CgTranscript />
                            </pre>
                          </>
                        )}
                      </>
                    ) : null}
                  </div>
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
                          <p>Save changes.</p>
                          <small>Save Shortcut Key</small>
                          <br />
                          <br />
                          <kbd>Ctrl</kbd> + <kbd>S</kbd>
                        </div>
                      }
                      placement='top'
                    >
                      <span>
                        <Button
                          size='sm'
                          variant='success'
                          style={{
                            width: 'fit-content',
                            pointerEvents: oldTS === transcription && 'none',
                          }}
                          onClick={saveChanges}
                          disabled={oldTS === transcription || saving}
                        >
                          {saving ? (
                            <Spinner animation='border' size='sm' />
                          ) : (
                            <>
                              Save{' '}
                              <FaSave
                                size='2em'
                                style={{ marginLeft: '3px' }}
                              />
                            </>
                          )}
                        </Button>
                      </span>
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
                      <span>
                        <Button
                          size='sm'
                          variant='warning'
                          style={{
                            width: 'fit-content',
                            pointerEvents: oldTS === transcription && 'none',
                            marginLeft: '10px ',
                          }}
                          onClick={undoChanges}
                          disabled={oldTS === transcription || saving}
                        >
                          Undo{' '}
                          <FaUndo size='2em' style={{ marginLeft: '3px' }} />
                        </Button>
                      </span>
                    </OverlayToolTip>
                    <OverlayToolTip
                      content={
                        <div style={{ margin: '5px' }}>
                          <p>Export current project to the web.</p>
                        </div>
                      }
                      placement='top'
                    >
                      <span>
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
                      </span>
                    </OverlayToolTip>
                  </div>
                </Row>
                <Row
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%',
                    flexDirection: 'row',
                    maxHeight: '50vh',
                    overflowY: 'scroll',
                    paddingLeft: '20px',
                    paddingBottom: '20px',
                  }}
                  className='border'
                >
                  {transcriptionLoading ? (
                    <div
                      style={{
                        height: 'max-content',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {' '}
                      Loading Transcription ...{' '}
                      <Spinner animation='border' variant='info' size='sm' />
                    </div>
                  ) : (
                    parsedJson &&
                    parsedJson.map((x) => {
                      return (
                        <>
                          <div style={{ height: '25px' }} />
                          {x.words.map((word, i) => {
                            return (
                              <>
                                <TranscriptionWord word={word} key={word + i} />
                                &nbsp;
                              </>
                            );
                          })}
                        </>
                      );
                    })
                  )}
                </Row>
              </Col>
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

        <div id='waveform'></div>
      </Col>
      <Col lg={2} xs={0}></Col>
    </Row>
  );
}

export default CurrentProject;
