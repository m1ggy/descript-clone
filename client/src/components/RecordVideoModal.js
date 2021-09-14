import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Accordion, Alert } from 'react-bootstrap';
import useRecorder from '../hooks/useRecorder';
import CountDown from './CountDown';
import OverlayToolTip from './OverlayToolTip';
import { FaQuestionCircle } from 'react-icons/fa';
import { IoSettingsOutline } from 'react-icons/io5';
import useStore from '../store';
import useProject from '../hooks/useProject';

function RecordVideoModal({ show, setShow }) {
  const [options, setOptions] = useState({ audio: false, video: true });
  const [recording, setRecording] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [proceed, setProceed] = useState(false);
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [message, setMessage] = useState({ content: '', type: '' });
  const [serverMessage, setServerMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(false);

  const { createProject, getProjects, uploadMediaProject } = useProject();
  const projects = useStore((state) => state.projects);
  const unsub = useStore.subscribe(console.log, (state) => state.project);

  const preview = useRef();
  const { startRecording, stopRecording, url, recordingActive } = useRecorder(
    { audio: true, video: true },
    { audio: 'audio/webm', video: 'video/webm; codec=vp9' },
    true,
    true
  );
  const [delay, setDelay] = useState(3);

  ///local fucntions
  const handleClose = () => {
    setShow(!show);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setServerMessage({
        content: await createProject(projectName),
        type: 'success',
      });
    } catch (e) {
      console.log(e);
      setServerMessage({ content: e, type: 'danger' });
    }
    setProjectName('');
    setMessage({ type: '', content: '' });
    setServerMessage({ type: '', content: '' });

    await getProjects();

    console.log(projects);
    unsub();
    setLoading(false);
  };

  useEffect(() => {
    if (projectName === '') {
      return;
    } else if (projectName.length < 5 || projectName.length > 20) {
      return setMessage({
        type: 'danger',
        content: 'Project name should be 5 characters to 20 characters long!',
      });
    } else {
      const filtered = projects.filter(
        (x) => x.projectName === projectName.trim()
      );

      if (filtered.length) {
        return setMessage({
          type: 'danger',
          content: `You already have a project named ${projectName}`,
        });
      }
      setMessage({
        type: 'success',
        content: `${projectName} is available.`,
      });
    }
  }, [projectName, projects]);

  useEffect(() => {
    console.log(url);
    if (url) preview.current.src = url;
  }, [url]);
  useEffect(() => {
    setRecording(recordingActive);
  }, [recordingActive]);

  useEffect(() => {
    console.log(options.audio);
  }, [options]);

  return (
    <Modal show={show} onHide={handleClose} centered size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>New Project from Video Recording</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {proceed ? (
          <>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  type='text'
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  isInvalid={message.type === 'danger' && true}
                  isValid={message.type === 'success' && true}
                />
                <Form.Control.Feedback
                  type={message.type === 'success' ? 'valid' : 'invalid'}
                >
                  {message.content}
                </Form.Control.Feedback>
              </Form.Group>
              <Button disabled={loading} type='submit'>
                {loading ? 'Loading ...' : 'Submit'}
              </Button>
            </Form>
            {serverMessage.content !== '' && (
              <Alert variant={serverMessage.type}>
                {serverMessage.content}
              </Alert>
            )}
          </>
        ) : (
          <>
            <Form
              as='div'
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <Button
                  variant='success'
                  onClick={() => {
                    startRecording(
                      delay * 1000,
                      options.audio,
                      setShowCountdown,
                      options.audio,
                      setRecordingFinished
                    );
                  }}
                  style={{ width: 'fit-content' }}
                  disabled={recording}
                  size='sm'
                >
                  Start Recording 🔴
                </Button>
                <Button
                  variant='danger'
                  size='sm'
                  style={{ width: 'fit-content' }}
                  onClick={() => stopRecording()}
                  disabled={!recording}
                >
                  Stop Recording 🟥
                </Button>
              </div>
              <Accordion
                style={{ marginTop: '15px' }}
                defaultActiveKey='0'
                flush
              >
                <Accordion.Item eventKey='0'>
                  <Accordion.Header>
                    Preferences {'  '}
                    <IoSettingsOutline
                      size='1.2em'
                      style={{ marginLeft: '5px' }}
                    />
                  </Accordion.Header>
                  <Accordion.Body>
                    <div>
                      <Form.Group style={{ textAlign: 'center' }}>
                        <Form.Label
                          style={{ display: 'flex', justifyContent: 'center' }}
                        >
                          Delay
                          <OverlayToolTip
                            placement='bottom'
                            content={
                              <p>
                                Adjust the delay before starting the recording.
                              </p>
                            }
                          >
                            <div>
                              <FaQuestionCircle size='1em' />
                            </div>
                          </OverlayToolTip>
                        </Form.Label>

                        <Form.Control
                          value={delay}
                          onChange={(e) => {
                            setDelay(e.target.value);
                          }}
                          type='number'
                          max={10}
                          min={3}
                        />
                      </Form.Group>
                      <Form.Group
                        style={{
                          textAlign: 'center',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Form.Label
                          style={{ display: 'flex', justifyContent: 'center' }}
                        >
                          Capture Mic?
                          <OverlayToolTip
                            placement='bottom'
                            content={
                              <p>
                                Enable recording of audio from mic input. make
                                sure you have a mic connected!
                              </p>
                            }
                          >
                            <div>
                              <FaQuestionCircle size='1em' />
                            </div>
                          </OverlayToolTip>
                        </Form.Label>
                        <Form.Check
                          inline
                          value={options.audio}
                          onChange={(e) => {
                            setOptions({
                              ...options,
                              audio: e.target.checked,
                            });
                          }}
                          style={{ marginLeft: '10px' }}
                        />
                      </Form.Group>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Form>

            {showCountdown && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '25px',
                }}
              >
                <CountDown delay={delay} />
              </div>
            )}

            {recording && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '25px',
                }}
              >
                <h3>Recording now....</h3>
              </div>
            )}
            {url && (
              <div style={{ marginTop: '25px' }}>
                <h4>Preview</h4>
                <video
                  ref={preview}
                  controls
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            )}
          </>
        )}
        <Form></Form>
      </Modal.Body>

      <Modal.Footer>
        {recordingFinished && (
          <Button onClick={() => setProceed(true)} variant='success'>
            Proceed
          </Button>
        )}
        <Button variant='danger' onClick={() => setShow(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RecordVideoModal;
