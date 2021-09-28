import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import useRecorder from '../hooks/useRecorder';
import CountDown from './CountDown';
import TimeElapsed from './TimeElapsed';
import ProjectNameForm from './ProjectNameForm';
import useProject from '../hooks/useProject';
function RecordAudioModal({ show, setShow }) {
  const [proceed, setProceed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [startCountdown, setStartCountdown] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const preview = useRef(null);
  const [delay] = useState(3);
  const {
    startAudioRecording,
    stopRecording,
    recordingActive,
    currentBlob,
    url,
    resetRecorder,
  } = useRecorder();

  const { createProjectWithMedia, getProjects } = useProject();

  useEffect(() => {
    setRecording(recordingActive);
  }, [recordingActive]);

  useEffect(() => {
    if (preview.current && url) {
      preview.current.src = url;
    }
  });

  async function handler() {
    try {
      setLoading(true);
      const media = new FormData();
      media.append('media', currentBlob, `${projectName}.webm`);
      media.append('projectName', projectName);

      await toast.promise(createProjectWithMedia(media), {
        success: 'Created project.',
        pending: 'Uploading audio file and creating project...',
        error: 'Failed to create project.',
      });
    } catch (e) {}

    try {
      await toast.promise(getProjects(), {
        success: 'Projects updated.',
        pending: 'Fetching projects...',
        error: 'Failed to fetch projects.',
      });
    } catch (e) {}
    setShow(false);
    setLoading(false);
  }
  return (
    <Modal show={show} centered size='lg'>
      <Modal.Header>
        <Modal.Title>Create Project with Audio Recording</Modal.Title>
      </Modal.Header>
      <Modal.Body
        as='div'
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {proceed ? (
          <ProjectNameForm
            projectName={projectName}
            setProjectName={setProjectName}
            handler={handler}
          />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              <Button
                variant='success'
                style={{ width: 'fit-content' }}
                disabled={recording}
                size='sm'
                onClick={() => {
                  resetRecorder();
                  startAudioRecording(
                    3000,
                    setRecordingFinished,
                    setStartCountdown
                  );
                }}
              >
                Start Recording 🔴
              </Button>
              <Button
                variant='danger'
                size='sm'
                style={{ width: 'fit-content' }}
                disabled={!recording}
                onClick={() => {
                  stopRecording();
                }}
              >
                Stop Recording 🟥
              </Button>
            </div>
            {startCountdown && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '25px',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <p>Recording in:</p>

                <CountDown delay={delay} />
              </div>
            )}
            {recording && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '25px',
                  flexDirection: 'column',
                  textAlign: 'center',
                }}
              >
                <h3>Recording now....</h3>

                <TimeElapsed start={new Date()} stop={recordingFinished} />
              </div>
            )}
            {url && (
              <div style={{ marginTop: '25px' }}>
                <h4>Preview</h4>
                <audio ref={preview} controls />
              </div>
            )}{' '}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {recordingFinished && !proceed && (
          <Button onClick={() => setProceed(true)} variant='success'>
            Proceed
          </Button>
        )}
        {recordingFinished && proceed && (
          <Button
            onClick={() => setProceed(false)}
            variant='primary'
            disabled={loading}
          >
            Go Back
          </Button>
        )}
        <Button
          variant='danger'
          onClick={() => {
            setShow(false);
            resetRecorder();
          }}
          disabled={loading || startCountdown || recordingActive}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RecordAudioModal;
