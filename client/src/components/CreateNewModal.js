import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import useStore from '../store';
import useProject from '../hooks/useProject';

function CreateNewModal({ show, setShow }) {
  const handleClose = () => setShow(false);
  const [projectName, setProjectName] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const [serverMessage, setServerMessage] = useState({ type: '', content: '' });
  const projects = useStore((state) => state.projects);
  const [loading, setLoading] = useState(false);
  const { createProject, getProjects } = useProject();

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

  async function handleSubmit(e) {
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
    handleClose();
    setLoading(false);
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create new Project</Modal.Title>
      </Modal.Header>
      <Modal.Body as='form' onSubmit={handleSubmit}>
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
        {serverMessage.content !== '' && (
          <Alert variant={serverMessage.type}>{serverMessage.content}</Alert>
        )}
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
            disabled={message.type === 'success' ? false : true || loading}
          >
            {loading ? 'Loading ...' : 'Create Project'}
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='danger' onClick={() => setShow(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateNewModal;
