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
  const [validation, setValidation] = useState({
    username: {
      valid: false,
      message: '',
    },
    pass: {
      valid: false,
      message: '',
    },
    confirmPass: {
      valid: false,
      message: '',
    },
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (
      creds.password.length < 8 &&
      creds.password !== '' &&
      creds.confirmPass.length < 8
    ) {
      setValidation((val) => {
        return {
          ...val,
          pass: {
            valid: false,
            message: 'Password is too short!',
          },
        };
      });
    } else if (creds.password !== creds.confirmPass) {
      setValidation((val) => {
        return {
          ...val,
          confirmPass: {
            valid: false,
            message: 'Passwords do not match!',
          },
        };
      });
    } else {
      setMessage('');
    }

    if (creds.password.length >= 8)
      setValidation((val) => {
        return {
          ...val,
          pass: {
            valid: true,
            message: 'Password is valid.',
          },
        };
      });

    if (creds.password === creds.confirmPass) {
      setValidation((val) => {
        return {
          ...val,
          confirmPass: {
            valid: true,
            message: 'Passwords match!',
          },
        };
      });
    }
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
              isInvalid={creds.password.length ? !validation.pass.valid : null}
              isValid={creds.password.length ? validation.pass.valid : null}
            />

            <Form.Control.Feedback
              type={validation.pass.valid ? 'valid' : 'invalid'}
            >
              {validation.pass.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              required
              onChange={(e) =>
                setCreds({ ...creds, confirmPass: e.target.value })
              }
              isInvalid={
                creds.confirmPass.length ? !validation.confirmPass.valid : null
              }
              isValid={
                creds.confirmPass.length ? validation.confirmPass.valid : null
              }
              value={creds.confirmPass}
            />
            <Form.Control.Feedback
              type={validation.confirmPass.valid ? 'valid' : 'invalid'}
            >
              {validation.confirmPass.message}
            </Form.Control.Feedback>
          </Form.Group>

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
