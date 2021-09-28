import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileAudio, FaFileVideo } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import useProject from '../hooks/useProject';
import { toast } from 'react-toastify';
import useStore from '../store';
export function DropZone({ id, ...props }) {
  const loading = useStore((state) => state.loading);
  const setLoading = useStore((state) => state.setLoading);
  const { uploadMediaProject } = useProject();
  const onDrop = useCallback(
    async (acceptedFiles) => {
      setLoading(true);

      if (acceptedFiles.length === 0) {
        setLoading(false);
        return toast.error(
          'Please make sure file is of WebM or MP4 format and please select a single file!'
        );
      }

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
    accept: 'audio/webm, video/mp4',
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
        Uploading ....
        <Spinner size='sm' variant='primary' animation='border' />
      </div>
    );
  }

  return (
    <div {...getRootProps()} {...props}>
      <pre style={{ color: 'red' }}>
        Accepted file formats are: WebM for audio and MP4/WebM for video.
      </pre>
      <FaFileAudio size='2em' />
      <FaFileVideo size='2em' />
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here ...</p>
      ) : (
        <>
          <p>Drag file here</p>
          <p>OR</p>
          <Spinner />
          <p>Click here to select file</p>
        </>
      )}
    </div>
  );
}
