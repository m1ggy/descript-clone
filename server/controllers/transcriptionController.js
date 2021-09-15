import speech from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';

///storage
const gc = new Storage({
  keyFilename: `../descript-clone-d821ff774d24.json`,
  projectId: 'descript-clone',
});
const projectBucket = gc.bucket('project-files-dc');

///speech to text
const speechClient = new speech.SpeechClient({
  keyFilename: '../descript-clone-d821ff774d24.json',
  projectId: 'descript-clone',
});

const sampleRateHertz = 192000;
const languageCode = 'en-US';

const configWebm = {
  encoding: 'WEBM_OPUS',
  languageCode,
  audioChannelCount: 2,
  enableWordTimeOffsets: true,
};

const configMp3 = {
  encoding: 'MP3',
  languageCode,
  enableWordTimeOffsets: true,
};

export const getTranscription = async (req, res) => {
  res.status(200).json({ message: 'get transcription' });
};

export const createTranscription = async (req, res) => {
  const {
    user: { user },
    body: { projectName, filename },
  } = req;

  console.log(user, projectName, filename);

  let audio = {
    uri: `gs://${projectBucket.name}/${user}/${projectName}/${filename}`,
  };
  console.log(audio);
  let request = null;

  if (filename.includes('webm')) {
    request = {
      audio,
      config: configWebm,
    };
  } else if (filename.includes('mp3')) {
    request = {
      audio,
      config: configMp3,
    };
  }
  try {
    console.log('starting transcription');
    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();

    console.log('transcription complete');
    console.log(response);

    response.results.forEach((result) => {
      console.log(`Transcription: ${result.alternatives[0].transcript}`);
      result.alternatives[0].words.forEach((wordInfo) => {
        // NOTE: If you have a time offset exceeding 2^32 seconds, use the
        // wordInfo.{x}Time.seconds.high to calculate seconds.
        const startSecs =
          `${wordInfo.startTime.seconds}` +
          '.' +
          wordInfo.startTime.nanos / 100000000;
        const endSecs =
          `${wordInfo.endTime.seconds}` +
          '.' +
          wordInfo.endTime.nanos / 100000000;
        console.log(`Word: ${wordInfo.word}`);
        console.log(`\t ${startSecs} secs - ${endSecs} secs`);
      });
    });

    res.status(200).json({ message: 'create transcription post' });
  } catch (e) {
    console.log(e);
  }
};
