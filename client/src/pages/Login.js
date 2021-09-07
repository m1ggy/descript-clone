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

  document.title = 'Login --Descript Clone';
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({});
    setLoading(true);

    try {
      const message = await login(creds);
      if (message) {
        setLoading(false);
        return setMessage(message);
      }
      history.push('/projects');
    } catch {
      setLoading(false);
      setMessage({ content: 'An Error Occurred', type: 'danger' });
    }
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
            {loading ? 'Logging in ...' : 'Login'}
          </Button>
        </Card.Body>
        <Card.Footer>
          <p>
            Need an account? <Link to='/signup'> Signup.</Link>
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
