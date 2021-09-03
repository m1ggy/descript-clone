import React, { useState, useEffect } from 'react';
import './login.css';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
function handleSubmit(e) {
  e.preventDefault();
}

function Signup() {
  const [creds, setCreds] = useState({
    username: '',
    password: '',
    confirmPass: '',
  });
  const [message, setMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    if (
      creds.password.length < 8 &&
      creds.password !== '' &&
      creds.confirmPass.length < 8
    ) {
      setMessage('Password is too short.');
    } else if (creds.password !== creds.confirmPass) {
      setMessage('Passwords do not match!');
    } else setMessage('');
  }, [creds.password, creds.confirmPass]);

  return (
    <div className='wrap'>
      <h1>Descript Clone</h1>
      <Card as='form' onSubmit={handleSubmit} className='form-container'>
        <Card.Body>
          <Card.Title style={{ padding: '10px', fontWeight: 'bold' }}>
            Sign up
          </Card.Title>
          <Form.Group>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type='text'
              required
              onChange={(e) => setCreds({ ...creds, username: e.target.value })}
              value={creds.username}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              required
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              value={creds.password}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              required
              onChange={(e) =>
                setCreds({ ...creds, confirmPass: e.target.value })
              }
              value={creds.confirmPass}
            />
          </Form.Group>
          {message !== '' && (
            <Alert variant='danger' style={{ margin: '1rem' }}>
              {message}
            </Alert>
          )}
          <Button>Create Account</Button>
        </Card.Body>
        <Card.Footer>
          <p>
            Already have an Account? <Link to='/'>Sign in.</Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default Signup;
