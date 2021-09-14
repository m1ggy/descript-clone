import { useState } from 'react';

let captureStream = null;
let audioStream = null;
let recording = null;
let data = [];
let a2 = null;
let a1 = null;
let audio1 = null;
let audio2 = null;
let tracks = null;
let combinedAudio = null;
let destination = null;

const useRecorder = (
  screenOptions = { audio: true, video: true },
  mimeTypes = { audio: 'audio/webm', video: 'video/webm; codec=vp9' },
  video = true
) => {
  const [url, setUrl] = useState('');
  const [recordingActive, setRecordingActive] = useState(false);

  async function startRecording(
    delay,
    audio = true,
    setCountdown,
    enableAudio,
    finished
  ) {
    finished(false);
    setUrl('');
    data = [];
    ///check if user wants with audio
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
      ///TODO: refactor logic
      captureStream.addTrack(audioStream.getTracks()[0]);

      tracks = captureStream.getAudioTracks();
      const audioContext = new AudioContext();

      a1 = new MediaStream([tracks[0]], { mimeType: 'audio/webm' });
      if (tracks.length > 1) {
        a2 = new MediaStream([tracks[1]], { mimeType: 'audio/webm' });
      }

      audio1 = audioContext.createMediaStreamSource(a1);
      if (tracks.length > 1) {
        audio2 = audioContext.createMediaStreamSource(a2);
      }

      console.log(audio1.mediaStream.getAudioTracks());
      destination = audioContext.createMediaStreamDestination();

      audio1.connect(destination);
      if (tracks.length > 1) {
        audio2.connect(destination);
      }

      combinedAudio = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm',
      });

      console.log('Audio:', combinedAudio.stream.getTracks());
      console.log('Video:', captureStream.getTracks());

      tracks.forEach((track) => {
        captureStream.removeTrack(track);
      });

      captureStream.addTrack(combinedAudio.stream.getTracks()[0]);
      destination = null;
    }
    if (captureStream) {
      recording = new MediaRecorder(captureStream, {
        mimeType: mimeTypes.video,
      });

      recording.onstop = () => {
        ///stop all streams
        console.log(captureStream.getTracks());
        captureStream.getTracks().forEach((track) => {
          track.stop();
        });
        if (enableAudio) {
          combinedAudio.stream.getTracks().forEach((t) => t.stop());
          // stop tracks stream

          //stop temp mediarecorders tracks
          a1.getTracks().forEach((t) => t.stop());

          if (tracks.length > 1) {
            a2.getTracks().forEach((t) => t.stop());
          }
        }

        ///create new blob
        const blob = new Blob(data, { type: mimeTypes.video });
        ///set the new url
        setUrl(URL.createObjectURL(blob));
        setRecordingActive(false);
        finished(true);
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
