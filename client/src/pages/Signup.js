import React, { useState, useEffect } from 'react';
import './login.css';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useStore from '../store';
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
  const [message, setMessage] = useState({ content: '', type: '' });
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { signup } = useAuth();
  const user = useStore((state) => state.username);

  document.title = 'Create Account --Descript Clone';

  useEffect(() => {
    if (creds.password.length < 8 && creds.password !== '') {
      setValidation((val) => {
        return {
          ...val,
          pass: {
            valid: false,
            message: 'Password is too short!',
          },
        };
      });
    } else if (creds.password.length >= 8)
      setValidation((val) => {
        return {
          ...val,
          pass: {
            valid: true,
            message: 'Password is valid.',
          },
        };
      });

    if (creds.password !== creds.confirmPass) {
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

  useEffect(() => {
    if (user !== '') {
      history.push('/projects');
    }
  });

  useEffect(() => {
    if (creds.username.trim().length === 0) {
      setValidation((val) => {
        return {
          ...val,
          username: {
            valid: false,
            message: 'Whitespaces is not valid!',
          },
        };
      });
    } else if (creds.username.length < 3 || creds.username.length > 20) {
      setValidation((val) => {
        return {
          ...val,
          username: {
            valid: false,
            message: 'username must be 3 characters to 20 characters long!',
          },
        };
      });
    } else {
      setValidation((val) => {
        return {
          ...val,
          username: {
            valid: true,
            message: 'username is valid!',
          },
        };
      });
    }
  }, [creds.username]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const msg = await signup(creds);
    setLoading(false);
    if (msg) {
      setMessage(msg);
    }
  }
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
              isInvalid={
                creds.username.length ? !validation.username.valid : null
              }
              isValid={creds.username.length ? validation.username.valid : null}
            />
            <Form.Control.Feedback
              type={validation.username.valid ? 'valid' : 'invalid'}
            >
              {validation.username.message}
            </Form.Control.Feedback>
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

          <Button
            type='submit'
            disabled={
              validation.confirmPass.valid === false ||
              validation.pass.valid === false ||
              validation.username.valid === false
                ? true
                : false
            }
          >
            {loading ? 'Creating account ...' : 'Create Account'}
          </Button>
        </Card.Body>
        <Card.Footer>
          <p>
            Already have an Account? <Link to='/'>Sign in.</Link>
          </p>
        </Card.Footer>
      </Card>
      {message.content && (
        <Alert variant={message.type} style={{ margin: '20px' }}>
          {message.content}
        </Alert>
      )}
    </div>
  );
}

export default Signup;
