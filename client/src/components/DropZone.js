import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import useStore from '../store';
import { Spinner } from 'react-bootstrap';
import useProject from '../hooks/useProject';
import { toast } from 'react-toastify';
export function DropZone({ id, ...props }) {
  const setLoading = useStore((state) => state.setLoading);
  const loading = useStore((state) => state.loading);
  const { uploadMediaProject } = useProject();
  const onDrop = useCallback(
    async (acceptedFiles) => {
      setLoading(true);
      console.log(acceptedFiles);
      const media = new FormData();

      media.append('media', acceptedFiles[0]);
      toast
        .promise(uploadMediaProject(id, media), {
          pending: 'Uploading File ...',
          success: 'File upload successful.',
          rejection: 'Failed to upload file.',
        })
        .then(() => {
          setLoading(false);
        });
    },
    [id, setLoading, uploadMediaProject]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'audio/mpeg, video/mp4',
    maxFiles: 1,
  });

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <Spinner size='lg' variant='primary' animation='border' />
      </div>
    );
  }

  return (
    <div {...getRootProps()} {...props}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <>
          <p>Drag files here</p>
          <p>----OR----</p>
          <Spinner />
          <p>Click here to select files</p>
        </>
      )}
    </div>
  );
}
