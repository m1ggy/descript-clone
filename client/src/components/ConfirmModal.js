import React from 'react';
import { Modal, Button } from 'react-bootstrap';
function ConfirmModal({ show, setShow, handler }) {
  const handleClose = () => {
    setShow(!show);
    handler();
  };
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Logout ...</Modal.Title>
      </Modal.Header>
      <Modal.Body>Do you want to log off?</Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={handleClose}>
          Yes
        </Button>
        <Button variant='danger' onClick={() => setShow(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
