import React, { useState } from 'react';
import { Col, Row, Dropdown } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import useStore from '../store';
import useAuth from '../hooks/useAuth';
function UserHeader() {
  const user = useStore((state) => state.username);
  const { signout } = useAuth();
  const [show, setShow] = useState(false);
  return (
    <Row className='header-user'>
      <ConfirmModal show={show} setShow={setShow} handler={signout} />
      <Col lg={2} className='username'>
        <h5>Hello, {user} </h5>
      </Col>
      <Col lg={2} className='centered'>
        <Dropdown style={{ width: 'fit-content' }}>
          <Dropdown.Toggle variant='primary'>Account</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setShow(true)}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Col>
    </Row>
  );
}

export default UserHeader;
