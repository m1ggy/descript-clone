import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { Modal, Button, Form } from 'react-bootstrap';
function CreateNewModal({ show, setShow }) {
  const handleClose = () => setShow(false);
  const [projectName, setProjectName] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const { checkProjectAvailability } = useAuth();

  ////TODO: Replace REST API call with local project array in global state
  useEffect(() => {
    if (projectName.trim() === '') {
      return setMessage({
        type: 'danger',
        content: 'Cannot use whitespace as project name !',
      });
    }
    (async () => {
      setMessage(await checkProjectAvailability(projectName));
    })();
  }, [projectName]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create new Project</Modal.Title>
      </Modal.Header>
      <Modal.Body as='form'>
        <Form.Group>
          <Form.Label>Project Name</Form.Label>
          <Form.Control
            required
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
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Button variant='primary' type='submit' style={{ margin: '25px' }}>
            Create Project
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='danger' onClick={() => setShow(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateNewModal;
