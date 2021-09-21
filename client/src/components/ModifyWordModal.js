import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
// import useStore from '../store';
function ModifyWordModal({
  show = false,
  setShow = () => null,
  title = '',
  type = '',
  word = { word: '' },
}) {
  const onHide = () => setShow(false);
  //   const [loading, setLoading] = useState(false);
  const [newWord, setNewWord] = useState('');
  //   const transcription = useStore((state) => state.transcription);
  const handleEdit = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    setNewWord(word.word);
  }, [word.word]);

  return (
    <Modal
      size='md'
      aria-labelledby='contained-modal-title-vcenter'
      centered
      show={show}
      onClose={onHide}
    >
      <Modal.Header closeButton>
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
          <>
            <Form onSubmit={handleEdit}>
              <Form.Group>
                <Form.Label>Replace Text and Audio</Form.Label>
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
        ) : type === 'deleteWord' ? (
          <>
            <p>Do you want to delete this word? the audio will be muted.</p>
            <Button>Confirm Delete</Button>
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModifyWordModal;
