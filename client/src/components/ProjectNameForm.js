import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

import useStore from '../store';

function ProjectNameForm({
  projectName,
  setProjectName,
  handler = () => null,
}) {
  const [message, setMessage] = useState({ content: '', type: '' });
  const [serverMessage, setServerMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(false);

  const projects = useStore((state) => state.projects);

  useEffect(() => {
    if (projectName === '') {
      return;
    } else if (projectName.length < 5 || projectName.length > 20) {
      return setMessage({
        type: 'danger',
        content: 'Project name should be 5 characters to 20 characters long!',
      });
    } else {
      const filtered = projects.filter(
        (x) => x.projectName === projectName.trim()
      );

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

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    handler();
    setProjectName('');
    setMessage({ type: '', content: '' });
    setServerMessage({ type: '', content: '' });
    setLoading(false);
  }
  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Project Name</Form.Label>
          <Form.Control
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
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            disabled={
              loading ? true : message.type === 'success' ? false : true
            }
            type='submit'
            variant='outline-success'
          >
            {loading ? 'Loading ...' : 'Submit'}
          </Button>
        </div>
      </Form>
      {serverMessage.content !== '' && (
        <Alert variant={serverMessage.type}>{serverMessage.content}</Alert>
      )}
    </>
  );
}

export default ProjectNameForm;
