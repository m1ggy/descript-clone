import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { Dropdown, Col, Row, Button, Table } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import './projects.css';
import CreateNewModal from '../components/CreateNewModal';
import UserHeader from '../components/UserHeader';
import useProject from '../hooks/useProject';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { formatDateLocale } from '../helpers/date';
import RecordVideoModal from '../components/RecordVideoModal';
import RecordAudioModal from '../components/RecordAudioModal';

function Projects() {
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showVideoCreate, setShowVideoCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [showAudioCreate, setShowAudioCreate] = useState(false);
  const user = useStore((state) => state.username);
  const projects = useStore((state) => state.projects);
  const history = useHistory();
  const { deleteProject, getProjects } = useProject();

  document.title = `${user}'s Projects --Descript Clone`;

  return (
    <>
      <Row className='wrapper'>
        <CreateNewModal show={showCreate} setShow={setShowCreate} />
        <RecordVideoModal show={showVideoCreate} setShow={setShowVideoCreate} />
        <RecordAudioModal show={showAudioCreate} setShow={setShowAudioCreate} />
        <ConfirmDeleteModal
          show={showDelete}
          setShow={setShowDelete}
          project={selectedProject}
          handler={deleteProject}
          get={getProjects}
        />
        <Col lg={2}></Col>
        <Col>
          <Row className='project-header'>
            <UserHeader />
            <Row>
              <Col>
                <h1>Projects</h1>
              </Col>
            </Row>
          </Row>
          <Row>
            <Row>
              <Dropdown className='create-project-dropdown'>
                <Dropdown.Toggle variant='success'>
                  Create new Project
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowVideoCreate(true)}>
                    Video Recording
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setShowAudioCreate(true)}>
                    Audio Recording
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setShowCreate(true)}>
                    Empty Project
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Row>
            <Col className='project-nav-items'>
              <Row
                className='w-100'
                style={{
                  overflowY: projects.length > 0 ? 'scroll' : 'hidden',
                  maxHeight: '75vh',
                }}
              >
                <Table hover>
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length > 0 &&
                      projects.map((x) => {
                        return (
                          <tr key={x.projectName}>
                            <td>{x.projectName}</td>
                            <td>{formatDateLocale(x.createdAt)}</td>
                            <td>
                              <Button
                                variant='success'
                                onClick={async () => {
                                  history.push(`/projects/${x.id}`);
                                }}
                              >
                                Open
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedProject(x.projectName);
                                  setShowDelete(true);
                                }}
                                style={{ marginLeft: '5px' }}
                                variant='danger'
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              </Row>
              {projects.length === 0 && (
                <Row className='centered' style={{ height: '150px' }}>
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
