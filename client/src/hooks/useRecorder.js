import { useState } from 'react';

let captureStream = null;
let audioStream = null;
let recording = null;
let data = [];

const useRecorder = (
  screenOptions = { audio: false, video: true },
  mimeTypes = { audio: 'audio/webm', video: 'video/webm; codec=vp9' },
  video = true
) => {
  const [url, setUrl] = useState('');
  const [recordingActive, setRecordingActive] = useState(false);

  async function startRecording(delay, audio = true, setCountdown) {
    ///check if user wants with audio
    setUrl('');
    data = [];
    if (audio) {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      } catch (e) {
        console.log(e);
      }
    }
    if (video) {
      try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(
          screenOptions
        );
      } catch (e) {
        console.log(e);
      }
    }
    if (captureStream && audioStream) {
      captureStream.addTrack(audioStream.getTracks()[0]);
    }
    if (captureStream) {
      recording = new MediaRecorder(captureStream, {
        mimeType: mimeTypes.video,
      });

      recording.onstop = () => {
        ///stop all streams
        captureStream.getTracks().forEach((track) => {
          track.stop();
        });

        ///create new blob
        const blob = new Blob(data, { type: mimeTypes.video });
        ///set the new url
        setUrl(URL.createObjectURL(blob));
        setRecordingActive(false);

        ///reset media variables
        recording = null;
        captureStream = null;
        audioStream = null;
      };
      if (recording) {
        setCountdown(true);
        setTimeout(() => {
          setRecordingActive(true);
          setCountdown(false);
          recording.start();
        }, delay);
      }
    }
  }
  function stopRecording() {
    ///stop recording
    recording.stop();
    ///add chunks to data array
    recording.ondataavailable = (e) => data.push(e.data);
  }

  return {
    startRecording,
    stopRecording,
    url,
    recordingActive,
  };
};

export default useRecorder;
