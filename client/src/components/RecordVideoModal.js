import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import useRecorder from '../hooks/useRecorder';
import CountDown from './CountDown';
import OverlayToolTip from './OverlayToolTip';
import { FaQuestionCircle } from 'react-icons/fa';
function RecordVideoModal({ show, setShow }) {
  const [options, setOptions] = useState({ audio: false, video: true });
  const [recording, setRecording] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showPref, setShowPref] = useState(true);
  const preview = useRef();
  const { startRecording, stopRecording, url, recordingActive } = useRecorder(
    { audio: true, video: true },
    { audio: 'audio/webm', video: 'video/webm; codec=vp9' },
    true,
    true
  );
  const [delay, setDelay] = useState(3);
  const handleClose = () => {
    setShow(!show);
  };

  useEffect(() => {
    console.log(url);
    if (url) preview.current.src = url;
  }, [url]);
  useEffect(() => {
    setRecording(recordingActive);
  }, [recordingActive]);

  return (
    <Modal show={show} onHide={handleClose} centered size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>New Project from Video Recording</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
                startRecording(delay * 1000, options.audio, setShowCountdown);
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
          <div
            style={{ display: 'flex', marginTop: '15px', marginBottom: '10px' }}
          >
            <h4>Preferences</h4>
            <pre onClick={() => setShowPref(!showPref)}>
              {showPref ? 'Hide' : 'Show'}
            </pre>
          </div>

          {showPref && (
            <>
              <Form.Group style={{ textAlign: 'center' }}>
                <Form.Label
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  Delay
                  <OverlayToolTip
                    placement='bottom'
                    content={
                      <p>Adjust the delay before starting the recording.</p>
                    }
                  >
                    <div>
                      <FaQuestionCircle size='1em' />
                    </div>
                  </OverlayToolTip>
                </Form.Label>

                <Form.Control
                  inline
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
                        Enable recording of audio from mic input. make sure you
                        have a mic connected!
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
            </>
          )}
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
        {recording && <h3>Recording now....</h3>}
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
      </Modal.Body>

      <Modal.Footer>
        <Button variant='danger' onClick={() => setShow(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RecordVideoModal;
