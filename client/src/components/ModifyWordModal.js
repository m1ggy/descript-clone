import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import useMemento from '../hooks/useMemento';
import useEdit from '../hooks/useEdit';
import EditAudioAndText from './EditAudioAndText';

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
  const { editAudioAndText, editAudioWithExisting } = useEdit();
  const [recording, setRecording] = useState(false);
  const [useExisting, setUseExisting] = useState(false);

  const onHide = () => {
    setShow(false);
  };
  const handleEdit = (e) => {
    e.preventDefault();

    setNewMemento(pIndex, wIndex, newWord);
    setShow(false);
    setNewWord('');
    setRerender((old) => !old);
  };

  const handleEditAudioText = async (e, newRecording) => {
    e.preventDefault();
    setShow(false);
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
          />
        ) : type === 'deleteWord' ? (
          <>
            <p>Do you want to delete this word? the audio will be muted.</p>
            <Button>Confirm Delete</Button>
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide} disabled={recording} variant='outline-danger'>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModifyWordModal;
