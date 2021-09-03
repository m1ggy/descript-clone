import React, { useState, useEffect } from 'react';
import './login.css';
import { Card, Form, Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
function handleSubmit(e) {
  e.preventDefault();
}
function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const history = useHistory();

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
          <Button>Login</Button>
        </Card.Body>
        <Card.Footer>
          <p>
            Need an account? <Link to='/signup'>Sign up.</Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default Login;
