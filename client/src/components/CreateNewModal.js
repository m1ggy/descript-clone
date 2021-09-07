import React, { useEffect, useState } from 'react';

import { Modal, Button, Form } from 'react-bootstrap';
import useStore from '../store';
function CreateNewModal({ show, setShow }) {
  const handleClose = () => setShow(false);
  const [projectName, setProjectName] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const projects = useStore((state) => state.projects);

  ////TODO: Replace REST API call with local project array in global state
  useEffect(() => {
    if (projectName.trim() === '') {
      return setMessage({
        type: 'danger',
        content: 'Cannot use whitespace as project name !',
      });
    } else if (projectName.length < 5 || projectName.length > 20) {
      return setMessage({
        type: 'danger',
        content: 'Project name should be 5 characters to 20 charaacters long!',
      });
    } else {
      const filtered = projects.filter((x) => x.name === projectName);
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
          <Button
            variant='primary'
            type='submit'
            style={{ margin: '25px' }}
            disabled={message.type === 'success' ? false : true}
          >
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
