import React, { useState, useEffect, useCallback } from 'react';
import { Col, Row, Button, ListGroup, Spinner } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaSave,
  FaUndo,
  FaArrowLeft,
  FaFileExport,
  FaCheck,
  FaRedo,
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
import useMemento from '../hooks/useMemento';
import './currentProject.css';
import useProject from '../hooks/useProject';
import useEdit from '../hooks/useEdit';
import ConfirmExportModal from '../components/ConfirmExportModal';
import { useBeforeunload } from 'react-beforeunload';

let mediaLength = 0;
let mementoSelector = (state) => state.memento;
function CurrentProject() {
  const history = useHistory();
  const { id } = useParams();
  const [selectedMedia, setSelectedMedia] = useState({});
  const [showMedia, setShowMedia] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const currentProject = useStore((state) => state.currentProject);
  const setCurrentProject = useStore((state) => state.setCurrentProject);
  const setTranscription = useStore((state) => state.setTranscription);
  const clearTranscription = useStore((state) => state.clearTranscription);
  const setAudioMemento = useStore((state) => state.setAudioMemento);

  const [rawJson, setRawJson] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [destroy, setDestroy] = useState(false);
  const [files, setFiles] = useState([]);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);

  const { createTranscription, fetchTranscription } = useTranscription();
  const { saveTranscription } = useProject();
  const { flush, undo, redo, undoSnapshots, redoSnapshots, save } =
    useMemento();
  const { fetchProject } = useProject();
  const { flushEdits, saveAudio } = useEdit();

  const setMemento = useStore((state) => state.setMemento);
  const memento = useStore(mementoSelector);
  const loading = useStore((state) => state.loading);
  const setLoading = useStore((state) => state.setLoading);

  useBeforeunload((e) => {
    if (saving || loading) {
      e.preventDefault();
    } else if (undoSnapshots.length || redoSnapshots.length) {
      e.preventDefault();
    }
  });

  useEffect(() => {
    setMemento([]);
    setTranscription([]);
    setLoading(false);

    function fetchproject(id) {
      fetchProject(id).catch(() => {
        history.push('/404');
      });
    }

    fetchproject(id);
    //eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (currentProject == null) return;

    document.title = `${currentProject.projectName} --Descript Clone`;
    if (currentProject.files) {
      if (currentProject.files.json !== {}) {
        setRawJson(currentProject.files.json);
      }
      mediaLength = currentProject.files.media.length;
      setFiles(currentProject.files.media);
    }
  }, [currentProject]);

  ///fetch json data
  useEffect(() => {
    async function fetchJson() {
      setTranscriptionLoading(true);
      setTranscription(await fetchTranscription(rawJson.url));
      setMemento(await fetchTranscription(rawJson.url));
      setTranscriptionLoading(false);
    }

    if (rawJson) {
      fetchJson();
    }
    //eslint-disable-next-line
  }, [rawJson]);

  const transcribe = useCallback(async () => {
    setTranscribing(true);
    setLoading(true);
    const file = currentProject.files.media.filter((x) => {
      return x.type.includes('audio');
    })[0];

    await toast.promise(
      createTranscription(currentProject.projectName, file.name),
      {
        success: 'Created Transcription',
        error: 'Failed to create transcription',
        pending: 'Transcribing ...',
      }
    );
    setTranscribing(false);
    setLoading(false);
  }, [createTranscription, currentProject, setLoading]);

  const saveTS = async (id) => {
    setSaving(true);
    setLoading(true);
    await toast.promise(saveTranscription(id, memento), {
      success: 'Saved changes',
      pending: 'Saving changes ...',
      error: 'Failed to save changes',
    });
    await saveAudio();
    save();
    setSaving(false);
    setLoading(false);
  };

  const handleUndo = () => {
    undo();
    toast.warn('Undo', { autoClose: 2000 });
  };
  const handleRedo = () => {
    redo();
    toast.warn('Redo', { autoClose: 2000 });
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
        <ConfirmExportModal show={showExport} setShow={setShowExport} />
        <Row className='project-header'>
          <UserHeader />
          <h1>{currentProject.projectName}</h1>
        </Row>
        <Row style={{ borderBottom: '2px solid black', marginBottom: '10px' }}>
          <Button
            onClick={async () => {
              history.goBack();
              setCurrentProject({});
              setDestroy(true);
              flush();
              clearTranscription();
              setAudioMemento([]);
              await flushEdits();
            }}
            style={{
              width: 'fit-content',
              marginLeft: '35px',
              marginBottom: '25px',
            }}
            disabled={transcribing || saving || loading}
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
                  {currentProject.files?.json && (
                    <ListGroup.Item
                      action
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => {
                        setSelectedMedia(
                          currentProject.files.json && currentProject.files.json
                        );
                        setShowMedia(true);
                      }}
                    >
                      Transcription File
                    </ListGroup.Item>
                  )}
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
                          {x.name.length > 20
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
                  saveTS(id);
                } else if (e.ctrlKey && e.key === 'z') {
                  e.preventDefault();
                  handleUndo();
                } else if (e.ctrlKey && e.shiftKey && e.key === 'z') {
                  e.preventDefault();
                  handleRedo();
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
                  {currentProject.exported ? (
                    <pre
                      style={{
                        margin: 0,
                        textDecoration: 'underline',
                        width: 'fit-content',
                        cursor: 'pointer',
                      }}
                      className='text-info'
                      onClick={() => history.push(`/projects/${id}/exported`)}
                    >
                      View Exported <FaFileExport />
                    </pre>
                  ) : null}
                  <div>
                    {rawJson ? (
                      <>
                        <pre
                          style={{
                            margin: 0,
                            color: 'green',
                            width: 'fit-content',
                          }}
                        >
                          Transcribed <FaCheck />
                        </pre>
                        {!(undoSnapshots.length || redoSnapshots.length) &&
                          !loading && (
                            <pre
                              style={{
                                margin: 0,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                width: 'fit-content',
                              }}
                              onClick={transcribe}
                            >
                              rerun transcription <CgTranscript />
                            </pre>
                          )}
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

                  <div>
                    {undoSnapshots.length || redoSnapshots.length ? (
                      <pre style={{ margin: 0, color: 'red' }}>
                        Unsaved changes
                      </pre>
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
                            // pointerEvents: 'none',
                          }}
                          onClick={() => saveTS(id, memento)}
                          disabled={saving || loading}
                        >
                          <>
                            Save{' '}
                            <FaSave size='2em' style={{ marginLeft: '3px' }} />
                          </>
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

                            marginLeft: '10px ',
                          }}
                          disabled={
                            (undoSnapshots.length ? false : true) ||
                            loading ||
                            saving
                          }
                          onClick={handleUndo}
                        >
                          Undo{' '}
                          <FaUndo size='2em' style={{ marginLeft: '3px' }} />
                        </Button>
                      </span>
                    </OverlayToolTip>
                    <OverlayToolTip
                      content={
                        <div style={{ margin: '5px' }}>
                          <p>Redo recent undo.</p>
                          <small>Redo Shortcut Key</small>
                          <br />
                          <br />
                          <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>
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

                            marginLeft: '10px ',
                          }}
                          disabled={
                            (redoSnapshots.length ? false : true) ||
                            saving ||
                            loading
                          }
                          onClick={handleRedo}
                        >
                          Redo
                          <FaRedo size='2em' style={{ marginLeft: '3px' }} />
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
                          disabled={
                            loading ||
                            (undoSnapshots.length || redoSnapshots.length
                              ? true
                              : false)
                          }
                          onClick={() => setShowExport(true)}
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
                    files && <WaveSurfer link={files} destroy={destroy} />
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
