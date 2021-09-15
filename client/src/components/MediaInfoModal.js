import React, { useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import useProject from '../hooks/useProject';

import { formatDateLocale } from '../helpers/date';

function MediaInfoModal({ selectedMedia, show, setShow, id }) {
  const [loading, setLoading] = useState(false);
  const { deleteMediaProject } = useProject();
  const handleClose = () => setShow(false);
  const handleDelete = async () => {
    setLoading(true);
    toast
      .promise(
        deleteMediaProject(id, selectedMedia.name, selectedMedia?.converted),
        {
          pending: `Deleting media`,
          error: 'Failed to delete media',
          success: `Deleted ${selectedMedia.name}`,
        }
      )
      .then(() => {
        setLoading(false);
        setShow(false);
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered size='lg'>
      <Modal.Header closeButton={loading ? null : true}>
        <Modal.Title>{selectedMedia.name || 'Transcription'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Spinner animation='border' size='lg' />
          </div>
        ) : (
          Object.keys(selectedMedia).map((x) => {
            return (
              <div key={x}>
                <p>
                  {x === 'link' || x === 'url'
                    ? 'URL'
                    : x === 'createdAt'
                    ? 'Created on'
                    : x === 'updatedAt'
                    ? 'Updated on'
                    : x}
                  :{' '}
                  {x === 'url' || x === 'link' ? (
                    <a
                      href={selectedMedia[`${x}`]}
                      target='_blank'
                      rel='noreferrer'
                    >
                      Link
                    </a>
                  ) : x === 'createdAt' ? (
                    formatDateLocale(selectedMedia[`${x}`])
                  ) : (
                    selectedMedia[`${x}`].toString()
                  )}
                </p>
              </div>
            );
          })
        )}
      </Modal.Body>
      <Modal.Footer>
        {selectedMedia.type == null ||
        selectedMedia?.converted === true ? null : (
          <Button variant='primary' onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        )}
        <Button
          variant='danger'
          onClick={() => setShow(false)}
          disabled={loading}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MediaInfoModal;
