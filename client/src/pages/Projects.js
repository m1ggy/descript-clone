import React from 'react';
import useStore from '../store';
import './projects.css';
function Projects() {
  const user = useStore((state) => state.username);
  const projects = useStore((state) => state.projects);
  return (
    <div className='wrapper'>
      <div>
        <h5>Hello, {user} </h5>
        <h1>Projects</h1>
      </div>
      <div style={{ border: '1px black solid' }}>
        {projects ? (
          projects.map((x) => {
            return (
              <div>
                <p>{x.title}</p>
              </div>
            );
          })
        ) : (
          <p>No Projects</p>
        )}
      </div>
    </div>
  );
}

export default Projects;
