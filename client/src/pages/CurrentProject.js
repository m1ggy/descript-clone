import React, { useState, useEffect } from 'react';
import { Col, Row, Button, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  // FaSave,
  FaUndo,
  FaArrowLeft,
  FaFileExport,
  FaCheck,
} from 'react-icons/fa';
import { RiCloseLine } from 'react-icons/ri';
import { CgTranscript } from 'react-icons/cg';

import { DropZone } from '../components/DropZone';
import UserHeader from '../components/UserHeader';

import useTranscription from '../hooks/useTranscription';
import MediaInfoModal from '../components/MediaInfoModal';
import OverlayToolTip from '../components/OverlayToolTip';
import WaveSurfer from '../components/WaveSurfer';
import useStore from '../store';

import './currentProject.css';

let mediaLength = 0;

function CurrentProject() {
  const history = useHistory();

  const [selectedMedia, setSelectedMedia] = useState({});
  const [showMedia, setShowMedia] = useState(false);
  // const [saving, setSaving] = useState(false);
  const currentProject = useStore((state) => state.currentProject);
  const setCurrentProject = useStore((state) => state.setCurrentProject);
  const [rawJson, setRawJson] = useState(null);
  const [parsedJson, setParsedJson] = useState(null);
  const [transcribing, setTranscribing] = useState(false);

  const [destroy, setDestroy] = useState(false);

  const [files, setFiles] = useState([]);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);

  const { createTranscription } = useTranscription();

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
              setDestroy(true);
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

                if (e.ctrlKey && e.key === 's') {
                  e.preventDefault();
                } else if (e.ctrlKey && e.key === 'z') {
                  e.preventDefault();
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
                            pointerEvents: 'none',
                          }}
                          disabled={true}
                        >
                          {/* {saving ? (
                            <Spinner animation='border' size='sm' />
                          ) : (
                            <>
                              Save{' '}
                              <FaSave
                                size='2em'
                                style={{ marginLeft: '3px' }}
                              />
                            </>
                          )} */}
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
                            pointerEvents: 'none',
                            marginLeft: '10px ',
                          }}
                          disabled={true}
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
                          disabled={true}
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
                <Row>
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
                    files && (
                      <WaveSurfer
                        link={files}
                        parsedJson={parsedJson}
                        destroy={destroy}
                      />
                    )
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
      </Col>
      <Col lg={2} xs={0}></Col>
    </Row>
  );
}

export default CurrentProject;
