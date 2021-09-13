import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileAudio, FaFileVideo } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import useProject from '../hooks/useProject';
import { toast } from 'react-toastify';
export function DropZone({ id, ...props }) {
  const [loading, setLoading] = useState(false);
  const { uploadMediaProject } = useProject();
  const onDrop = useCallback(
    async (acceptedFiles) => {
      setLoading(true);
      console.log(acceptedFiles);

      if (acceptedFiles.length === 0) {
        setLoading(false);
        toast.error('Please make sure file is of MP3 or MP4 format.');
        return toast.error('Please select a single file!');
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
        Uploading ....
        <Spinner size='sm' variant='primary' animation='border' />
      </div>
    );
  }

  return (
    <div {...getRootProps()} {...props}>
      <pre style={{ color: 'red' }}>
        Accepted file formats are: MP3 for audio and MP4 for video.
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
