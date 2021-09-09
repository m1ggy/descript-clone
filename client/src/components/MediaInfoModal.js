import React from 'react';
import { Modal, Button } from 'react-bootstrap';
function MediaInfoModal({ selectedMedia, show, setShow }) {
  const handleClose = () => setShow(false);
  return (
    <Modal show={show} onHide={handleClose} centered size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>{selectedMedia.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Object.keys(selectedMedia).map((x) => {
          return (
            <>
              <p>
                {x} :
                {x === 'url' ? (
                  <a
                    href={selectedMedia[`${x}`]}
                    target='_blank'
                    rel='noreferrer'
                  >
                    Link
                  </a>
                ) : (
                  selectedMedia[`${x}`]
                )}
              </p>
            </>
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={handleClose}>
          Delete
        </Button>
        <Button variant='danger' onClick={() => setShow(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MediaInfoModal;
