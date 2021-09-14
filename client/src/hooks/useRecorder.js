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
  const [currentBlob, setCurrentBlob] = useState(null);

  /**
   * starts recording with video and/or audio
   * @param {number} delay delay before starting the recording
   * @param {boolean} audio boolean value to determine if audio is included, defaults to false
   * @param {function} setCountdown setter function for starting the countdown
   * @param {function} finished setter function to flag when recording is finished
   * @returns {void}
   */
  async function startRecording(delay, audio = false, setCountdown, finished) {
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
        audio = false;
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

      destination = audioContext.createMediaStreamDestination();

      audio1.connect(destination);
      if (tracks.length > 1) {
        audio2.connect(destination);
      }

      combinedAudio = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm',
      });

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
        console.log(combinedAudio);
        captureStream.getTracks().forEach((track) => {
          track.stop();
        });
        if (audio && combinedAudio) {
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
        setCurrentBlob(blob);
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

  /**
   * Stops the recording and saves chunks to the data array
   *
   */
  function stopRecording() {
    ///stop recording
    recording.stop();
    ///add chunks to data array
    recording.ondataavailable = (e) => data.push(e.data);
  }
  /**
   * Resets the recorder
   */
  function resetRecorder() {
    setCurrentBlob(null);
    setRecordingActive(false);
    setUrl('');
    data = [];
    recording = null;
    captureStream = null;
    audioStream = null;
  }

  /**Starts the audio recording, returns a boolean value
   *
   * @param {number} delay The amount of delay in milliseconds before starting the recording
   * @param {function} finished  the setter function to indicate if the recording is finished
   * @param {function} startCountdown the setter function to indicate the start of the countdown
   * @returns {boolean} returns a boolean value depending on the result of the recording
   */
  async function startAudioRecording(delay = 3000, finished, startCountdown) {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (audioStream.getTracks().length <= 0) return false;

      recording = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });

      recording.onstop = () => {
        ///stop all streams
        audioStream.getTracks().forEach((x) => {
          x.stop();
        });
        ///create new blob
        const blob = new Blob(data, { type: 'audio/webm' });
        ///set the blob and url
        setCurrentBlob(blob);
        setUrl(URL.createObjectURL(blob));
        //set flags
        setRecordingActive(false);
        finished(true);
        return true;
      };

      startCountdown(true);
      setTimeout(() => {
        recording.start();
        setRecordingActive(true);
        startCountdown(false);
      }, delay);
    } catch {
      return false;
    }
  }

  return {
    startRecording,
    stopRecording,
    url,
    recordingActive,
    currentBlob,
    resetRecorder,
    startAudioRecording,
  };
};

export default useRecorder;
