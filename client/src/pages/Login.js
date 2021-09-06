import React, { useState, useEffect } from 'react';
import './login.css';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useStore from '../store';

function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [message, setMessage] = useState({ type: '', content: '' });
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const user = useStore((state) => state.username);
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({});
    setLoading(true);

    try {
      const message = await login(creds);
      if (message) {
        return setMessage(message);
      }
      history.push('/projects');
    } catch {
      console.log('error occurred');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user !== '') {
      history.push('/projects');
    }
  }, [user, history]);

  return (
    <div className='wrap'>
      <h1>Descript Clone</h1>

      <Card as='form' onSubmit={handleSubmit} className='form-container'>
        <Card.Body>
          <Card.Title style={{ padding: '10px', fontWeight: 'bold' }}>
            Login
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

          <Button type='submit' disabled={loading}>
            Login
          </Button>
        </Card.Body>
        <Card.Footer>
          <p>
            Need an account?{' '}
            <Link to='/signup'> {loading ? 'Logging in ...' : 'Sign up.'}</Link>
          </p>
        </Card.Footer>
      </Card>
      {message.content && (
        <Alert variant={message.type} style={{ marginTop: '25px' }}>
          {message.content}
        </Alert>
      )}
    </div>
  );
}

export default Login;
