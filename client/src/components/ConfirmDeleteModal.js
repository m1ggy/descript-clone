import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
function ConfirmDeleteModal({ show, setShow, handler, project, get }) {
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    setLoading(true);

    await handler(project);
    await get();
    setShow(!show);
    setLoading(false);
  };
  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Delete Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>Do you want to delete {project}?</Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={handleClose} disabled={loading}>
          {loading ? 'Loading ...' : 'Yes'}
        </Button>
        <Button
          variant='danger'
          onClick={() => setShow(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmDeleteModal;
