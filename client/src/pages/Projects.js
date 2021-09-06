import React, { useState } from 'react';
import useStore from '../store';
import useAuth from '../hooks/useAuth';
import { Dropdown, Button, Col, Row } from 'react-bootstrap';
import './projects.css';
import ConfirmModal from '../components/ConfirmModal';
function Projects() {
  const [show, setShow] = useState(false);
  const user = useStore((state) => state.username);
  const projects = useStore((state) => state.projects);
  const { signout } = useAuth();

  document.title = `${user}'s Projects --Descript Clone`;
  return (
    <>
      <Row className='wrapper'>
        <ConfirmModal show={show} setShow={setShow} handler={signout} />
        <Col lg={2}></Col>
        <Col>
          <Row className='project-header'>
            <Row className='header-user'>
              <Col lg={1} className='username'>
                <h5>Hello, {user} </h5>
              </Col>
              <Button variant='outline-danger' onClick={() => setShow(true)}>
                Logout
              </Button>
            </Row>
            <Row>
              <Col>
                <h1>Projects</h1>
              </Col>
            </Row>
          </Row>
          <Row className='project-nav' border>
            <Row className='project-nav-buttons'>
              <Dropdown>
                <Dropdown.Toggle variant='success'>
                  Create new Project
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Video Recording</Dropdown.Item>
                  <Dropdown.Item>Audio Recording</Dropdown.Item>
                  <Dropdown.Item>Empty Project</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Row>
            <Col className='project-nav-items'>
              <table variant='primary' className='project-table'>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Project Length</th>
                    <th>Actions</th>
                    <th>Open</th>
                  </tr>
                </thead>
                {projects.length > 0 ? (
                  projects.map((x) => {
                    return (
                      <Row>
                        <p>{x.title}</p>
                      </Row>
                    );
                  })
                ) : (
                  <Row className='centered'>
                    <p>No Projects</p>
                  </Row>
                )}
              </table>
            </Col>
          </Row>
        </Col>
        <Col lg={2}></Col>
      </Row>
    </>
  );
}

export default Projects;
