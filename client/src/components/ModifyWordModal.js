import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import useMemento from '../hooks/useMemento';
import useEdit from '../hooks/useEdit';
import EditAudioAndText from './EditAudioAndText';
import AddNewWord from './AddNewWord';
import useStore from '../store';

function ModifyWordModal({
  show = false,
  setShow = () => null,
  title = '',
  type = '',
  pIndex,
  wIndex,
  setRerender,
  duration,
  word,
}) {
  const [newWord, setNewWord] = useState('');
  const { setNewMemento } = useMemento();
  const { editAudioAndText, editAudioWithExisting, addNewWord } = useEdit();
  const [recording, setRecording] = useState(false);
  const [useExisting, setUseExisting] = useState(false);
  const [recordingStarting, setRecordingStarting] = useState(false);
  const setLoading = useStore((state) => state.setLoading);

  const onHide = () => {
    setUseExisting(false);
    setRecording(false);
    setShow(false);
    setNewWord('');
  };
  const handleEdit = (e) => {
    e.preventDefault();
    setLoading(true);
    setNewMemento(pIndex, wIndex, newWord);
    setShow(false);
    setNewWord('');
    setRerender((old) => !old);
    setLoading(false);
  };

  const handleEditAudioText = async (e, newRecording) => {
    e.preventDefault();
    setRecordingStarting(false);
    setShow(false);
    setLoading(true);
    try {
      if (useExisting) {
        await toast.promise(
          editAudioWithExisting(
            pIndex,
            wIndex,
            newWord,
            word.startTime,
            word.endTime,
            duration
          ),
          {
            pending: 'Editing audio....',
            success: 'Successfully edited audio',
            error: {
              render({ data }) {
                return `${data}`;
              },
            },
          }
        );
      } else {
        await toast.promise(
          editAudioAndText(
            pIndex,
            wIndex,
            newWord,
            newRecording,
            duration,
            word.startTime,
            word.endTime
          ),
          {
            success: 'Edited Audio and Text',
            pending: 'Editing audio....',
            error: 'Failed to edit audio',
          }
        );
      }
    } catch {}
    setNewWord('');
    setRerender((old) => !old);
    setLoading(false);
  };

  const handleAddNewWord = async (e, currentBlob = null, position) => {
    e.preventDefault();
    setRecordingStarting(false);
    setShow(false);
    setLoading(true);
    try {
      if (useExisting) {
        await toast.promise(addNewWord(pIndex, wIndex, newWord, position), {
          success: 'Added new word',
          pending: 'Adding new word',
          error: 'Failed to add new word',
        });
      } else {
        await toast.promise(
          addNewWord(pIndex, wIndex, newWord, position, currentBlob),
          {
            success: 'Added new word',
            pending: 'Adding new word',
            error: 'Failed to add new word',
          }
        );
      }
    } catch {}
    setNewWord('');
    setRerender((old) => !old);
    setLoading(false);
  };

  return (
    <Modal
      size='md'
      aria-labelledby='contained-modal-title-vcenter'
      centered
      show={show}
    >
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {type === 'editText' ? (
          <>
            <Form onSubmit={handleEdit}>
              <Form.Group>
                <Form.Label>Edit Text</Form.Label>
                <Form.Control
                  type='text'
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                />
              </Form.Group>
              <Button type='submit'>Submit</Button>
            </Form>
          </>
        ) : type === 'replaceTextAudio' ? (
          <EditAudioAndText
            setNewWord={setNewWord}
            newWord={newWord}
            handleEditAudioText={handleEditAudioText}
            setRecording={setRecording}
            setUseExisting={setUseExisting}
            useExisting={useExisting}
            setRecordingStarting={setRecordingStarting}
          />
        ) : type === 'deleteWord' ? (
          <>
            <p>Do you want to delete this word? the audio will be muted.</p>
            <Button>Confirm Delete</Button>
          </>
        ) : type === 'addNewWord' ? (
          <AddNewWord
            setNewWord={setNewWord}
            newWord={newWord}
            setUseExisting={setUseExisting}
            useExisting={useExisting}
            setRecordingStarting={setRecordingStarting}
            handleAddNewWord={handleAddNewWord}
          />
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={onHide}
          disabled={recording || recordingStarting}
          variant='outline-danger'
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModifyWordModal;
