import React, { useState } from 'react';
import useStore from '../store';
import useAuth from '../hooks/useAuth';
import { Dropdown, Col, Row } from 'react-bootstrap';
import './projects.css';
import ConfirmModal from '../components/ConfirmModal';
import CreateNewModal from '../components/CreateNewModal';
function Projects() {
  const [show, setShow] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const user = useStore((state) => state.username);
  const projects = useStore((state) => state.projects);
  const { signout } = useAuth();

  document.title = `${user}'s Projects --Descript Clone`;
  return (
    <>
      <Row className='wrapper'>
        <ConfirmModal show={show} setShow={setShow} handler={signout} />
        <CreateNewModal show={showCreate} setShow={setShowCreate} />
        <Col lg={2}></Col>
        <Col>
          <Row className='project-header'>
            <Row className='header-user'>
              <Col lg={2} className='username'>
                <h5>Hello, {user} </h5>
              </Col>
              <Col lg={2} className='centered'>
                <Dropdown style={{ width: 'fit-content' }}>
                  <Dropdown.Toggle variant='primary'>
                    Account Settings
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setShow(true)}>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
            <Row>
              <Col>
                <h1>Projects</h1>
              </Col>
            </Row>
          </Row>
          <Row className='project-nav border'>
            <Row className='project-nav-buttons'>
              <Dropdown className='create-project-dropdown'>
                <Dropdown.Toggle variant='success'>
                  Create new Project
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Video Recording</Dropdown.Item>
                  <Dropdown.Item>Audio Recording</Dropdown.Item>
                  <Dropdown.Item onClick={() => setShowCreate(true)}>
                    Empty Project
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Row>
            <Col className='project-nav-items'>
              <Row className='w-100'>
                <table className='project-table'>
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Project Length</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length > 0 &&
                      projects.map((x) => {
                        return (
                          <tr key={x.name}>
                            <td>{x.name}</td>
                            <td>--</td>
                            <td>Open | Delete</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </Row>
              {projects.length === 0 && (
                <Row className='centered' style={{ height: '400px' }}>
                  <div className='centered-item'>
                    <p>No Projects</p>
                  </div>
                </Row>
              )}
            </Col>
          </Row>
        </Col>
        <Col lg={2}></Col>
      </Row>
    </>
  );
}

export default Projects;
