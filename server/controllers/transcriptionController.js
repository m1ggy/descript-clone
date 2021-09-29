import speech from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import projectModel from '../models/project';
import { configureCors } from '../storage';

const __dirname = path.resolve();
///create local temp dir if it does not exist

/**
 * Creates the temp folder
 */
async function makeTempDir() {
  await fs.promises.mkdir(`${__dirname}/temp/`, { recursive: true });
}

makeTempDir();

///storage
const gc = new Storage({
  keyFilename: `../descript-clone-d821ff774d24.json`,
  projectId: 'descript-clone',
});
const projectBucket = gc.bucket('project-files-dc');

configureCors(projectBucket);

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
  model: 'video',
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
  let request = {
    audio,
    config: configWebm,
  };

  try {
    console.log('starting transcription');
    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();

    console.log('transcription complete');

    const transcriptionLocalPath = `${__dirname}/temp/${user}-${projectName}-transcription.json`;

    await fs.promises.writeFile(
      transcriptionLocalPath,
      JSON.stringify(response.results, null, 2)
    );

    console.log('created local file');

    const transcriptionPath = `${user}/${projectName}/transcription.json`;

    await projectBucket.upload(transcriptionLocalPath, {
      destination: transcriptionPath,
      metadata: {
        cacheControl: 'private, max-age=0, no-transform',
      },
    });
    console.log('uploaded json file');

    const transcription = projectBucket.file(transcriptionPath);

    const currentProject = await projectModel.findOne({ projectName }).exec();

    if (currentProject == null)
      return res.status(404).json('Project does not exists');

    currentProject.transcribed = true;
    currentProject.files.json = {
      path: transcriptionPath,
      url: transcription.publicUrl(),
      createdAt: new Date(),
    };
    const modifiedDoc = await currentProject.save();
    console.log(modifiedDoc);
    console.log('added to db');

    await fs.promises.unlink(transcriptionLocalPath);
    console.log('deleted local file');
    return res
      .status(200)
      .json({ message: 'create transcription post', id: currentProject._id });
  } catch (e) {
    console.log(e);
    return res.status(404).json();
  }
};
