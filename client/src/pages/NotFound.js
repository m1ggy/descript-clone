import React from 'react';
import { useHistory } from 'react-router-dom';
import error404 from '../dist/404.png';
function NotFound() {
  const history = useHistory();
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div>
        {' '}
        <img
          src={error404}
          alt='error 404'
          style={{ height: '100%', width: '450px' }}
        />
      </div>

      <h1>Page not found</h1>
      <pre
        onClick={() => history.push('/projects')}
        style={{ textDecoration: 'underline', cursor: 'pointer' }}
      >
        Go back.
      </pre>
    </div>
  );
}

export default NotFound;
