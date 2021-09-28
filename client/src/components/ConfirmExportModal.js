import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import useExport from '../hooks/useExport';
import { toast } from 'react-toastify';
function ConfirmExportModal({ show, setShow }) {
  const { exportProject } = useExport();
  const handleClose = () => setShow(false);
  const handleExport = async () => {
    setShow(false);
    await toast.promise(exportProject(), {
      success: 'Exported project',
      pending: 'Exporting project. This might take a while.',
      error: 'Failed to export',
    });
  };
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Export Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>Export current project?</Modal.Body>
      <Modal.Footer>
        <Button variant='outline-info' onClick={handleExport}>
          Export
        </Button>
        <Button variant='danger' onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmExportModal;
