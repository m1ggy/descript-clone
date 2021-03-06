import projectBucket from '../storage/index';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import axios from 'axios';
import {
  AddNewAudioCut,
  addNewAudioExtract,
  cutAudio,
  deleteAudio,
  extractAudio,
  parseNewFloat,
} from '../utils';

const __dirname = path.resolve();
///create local temp dir if it does not exist

/**
 * Creates the temp folder
 */
async function makeTempDir() {
  await fs.promises.mkdir(`${__dirname}/temp/`, { recursive: true });
  await fs.promises.mkdir(`${__dirname}/temp/edit/`, { recursive: true });
}

makeTempDir();

///multer
const upload = multer({ dest: `${__dirname}/temp/edit` });

const editAudio = [
  upload.any(),
  async (req, res) => {
    try {
      const {
        user: { user },
        params: { id },
        files,
      } = req;

      await fs.promises.mkdir(`${__dirname}/temp/edit/${id}`, {
        recursive: true,
      });

      const [metadata] = files.filter((x) => x.mimetype.includes('json'));
      const [file] = files.filter((x) => x.mimetype.includes('audio'));

      let json = await fs.promises.readFile(metadata.path);
      json = JSON.parse(json);

      const currentAudioPath = `${__dirname}/temp/edit/${json.editId}.webm`;

      console.log(json);

      const response = await axios.get(json.url, { responseType: 'stream' });

      response.data.pipe(fs.createWriteStream(currentAudioPath));

      const start = parseFloat(
        `${(json.start.seconds && json.start.seconds) || '00'}.${
          json.start.nanos && json.start.nanos / 10000000
        }`
      );
      const end = parseFloat(
        `${(json.end.seconds && json.end.seconds) || '00'}.${
          json.end.nanos && json.end.nanos / 10000000
        }`
      );
      const outputPath = await cutAudio(
        currentAudioPath,
        file.path,
        start,
        end,
        json.projectName,
        json.duration
      );

      if (outputPath === false)
        return res.status(404).json({ message: 'Cannot edit audio' });

      const storagePath = `${user}/${json.projectName}/edits/${json.editId}.webm`;

      await projectBucket.upload(outputPath, {
        destination: storagePath,
        metadata: {
          cacheControl: 'private, max-age=0, no-transform',
        },
      });

      const newAudioFile = projectBucket.file(storagePath);

      await fs.promises.unlink(file.path);
      await fs.promises.unlink(metadata.path);
      await fs.promises.unlink(outputPath);
      await fs.promises.unlink(currentAudioPath);

      return res
        .status(200)
        .send({ url: newAudioFile.publicUrl(), id: json.editId });
    } catch (e) {
      console.log(e);
      return res.status(400).json(e);
    }
  },
];

const deleteEdits = async (req, res) => {
  const {
    user: { user },
    body: { projectName },
  } = req;

  try {
    const [files] = await projectBucket.getFiles();
    const filesToDelete = files.filter((x) =>
      x.name.includes(`${user}/${projectName}/edits/`)
    );

    filesToDelete.forEach(async (x) => {
      await x.delete();
    });

    return res.status(200).send();
  } catch {
    return res.status(404).send();
  }
};

const saveAudio = async (req, res) => {
  const {
    user: { user },
    body: { projectName, audio },
  } = req;

  console.log(user, projectName, audio);

  const audioPath = `${user}/${projectName}/${projectName}.webm`;
  const convertedAudioPath = `${user}/${projectName}/${projectName}Audio.webm`;
  const newAudioPath = `${__dirname}/temp/${projectName}-edited.webm`;
  try {
    const existingFile = projectBucket.file(audioPath);

    const response = await axios.get(audio.url, { responseType: 'stream' });

    response.data.pipe(fs.createWriteStream(newAudioPath));

    const file = projectBucket.file(convertedAudioPath);

    const convertedExists = await file.exists();
    const notConvertedExists = await existingFile.exists();

    if (convertedExists[0]) {
      console.log(convertedExists[0]);
      console.log('converted audio');

      await file.delete();
      await projectBucket.upload(newAudioPath, {
        destination: convertedAudioPath,
        metadata: {
          cacheControl: 'private, max-age=0, no-transform',
        },
      });
    } else {
      if (notConvertedExists[0]) {
        console.log(notConvertedExists[0]);
        console.log('natural audio');
        await existingFile.delete();

        await projectBucket.upload(newAudioPath, {
          destination: audioPath,
          metadata: {
            cacheControl: 'private, max-age=0, no-transform',
          },
        });
      }
    }

    await fs.promises.unlink(newAudioPath);

    return res.status(200).json();
  } catch (e) {
    console.log(e);
    return res.status(404).json(e);
  }
};

const editAudioWithExisting = async (req, res) => {
  const {
    user: { user },
    params: { id },
    body: { audio },
  } = req;

  await fs.promises.mkdir(`${__dirname}/temp/edit/${id}`, { recursive: true });
  const audioPath = `${__dirname}/temp/edit/${id}/${audio.projectName}.webm`;
  try {
    console.log(user, audio, id);

    const response = await axios.get(audio.url, { responseType: 'stream' });

    response.data.pipe(fs.createWriteStream(audioPath));

    const start = parseFloat(
      `${(audio.start.seconds && audio.start.seconds) || '00'}.${
        audio.start.nanos && audio.start.nanos / 100000
      }`
    );

    const end = parseFloat(
      `${(audio.end.seconds && audio.end.seconds) || '00'}.${
        audio.end.nanos && audio.end.nanos / 100000
      }`
    );

    const startOriginator = parseFloat(
      `${
        (audio.originator.startTime.seconds &&
          audio.originator.startTime.seconds) ||
        '00'
      }.${
        audio.originator.startTime.nanos &&
        audio.originator.startTime.nanos / 100000
      }`
    );

    const endOriginator = parseFloat(
      `${
        (audio.originator.endTime.seconds &&
          audio.originator.endTime.seconds) ||
        '00'
      }.${
        audio.originator.endTime.nanos &&
        audio.originator.endTime.nanos / 100000
      }`
    );

    const outputPath = await extractAudio(
      audioPath,
      start,
      end,
      audio.duration,
      startOriginator,
      endOriginator,
      audio.projectName
    );

    if (outputPath == false)
      return res.status(500).json('failed to edit audio');
    const storagePath = `${user}/${audio.projectName}/edits/${audio.editId}.webm`;

    await projectBucket.upload(outputPath, {
      destination: storagePath,
      metadata: {
        cacheControl: 'private, max-age=0, no-transform',
      },
    });

    const editedFile = projectBucket.file(storagePath);

    await fs.promises.unlink(outputPath);
    await fs.promises.unlink(audioPath);

    return res
      .status(200)
      .json({ url: editedFile.publicUrl(), id: audio.editId });
  } catch (e) {
    console.log(e);
    return res.status(404).json(e);
  }
};

const addNewWord = [
  upload.any(),
  async (req, res) => {
    const {
      user: { user },
      params: { id },
      files,
    } = req;
    let existingAudioPath = null;
    let newAudioPath = null;
    let config = null;
    let baseStart = null;
    let wordOriginator = null;
    let outputPath = null;
    try {
      await fs.promises.mkdir(`${__dirname}/temp/edit/${id}`, {
        recursive: true,
      });

      const [metadata] = files.filter((x) => x.mimetype.includes('json'));
      config = JSON.parse(await fs.promises.readFile(metadata.path));
      console.log(config);
      existingAudioPath = `${__dirname}/temp/edit/${id}/${config.projectName}.webm`;

      const response = await axios.get(config.url, { responseType: 'stream' });
      response.data.pipe(fs.createWriteStream(existingAudioPath));

      if (files.length > 1) {
        const [file] = files.filter((x) => x.mimetype.includes('audio'));
        newAudioPath = file.path;
      }
      const floats = parseNewFloat(config.baseWord, config.baseWord);
      if (config.position === 'left') {
        baseStart = floats.start;
      } else if (config.position === 'right') {
        baseStart = floats.end;
      }

      if (newAudioPath) {
        outputPath = await AddNewAudioCut(
          existingAudioPath,
          newAudioPath,
          baseStart,
          config.projectName,
          config.duration
        );
      } else {
        wordOriginator = parseNewFloat(config.originator, config.originator);
        outputPath = await addNewAudioExtract(
          existingAudioPath,
          baseStart,
          wordOriginator.start,
          wordOriginator.end,
          config.projectName
        );
      }

      const storagePath = `${user}/${config.projectName}/edits/${config.editId}.webm`;

      await projectBucket.upload(outputPath, {
        destination: storagePath,
        metadata: {
          cacheControl: 'private, max-age=0, no-transform',
        },
      });

      const editedFile = projectBucket.file(storagePath);

      await fs.promises.unlink(outputPath);
      if (existingAudioPath) await fs.promises.unlink(existingAudioPath);
      files.forEach(async (x) => {
        await fs.promises.unlink(x.path);
      });
      return res
        .status(200)
        .json({ url: editedFile.publicUrl(), id: config.editId });
    } catch (e) {
      console.log(e);
      return res.status(404).json(e);
    }
  },
];

const deleteWord = async (req, res) => {
  const {
    user: { user },
    body: { audio },
    params: { id },
  } = req;

  let outputPath = null;
  let existingAudioPath = `${__dirname}/temp/edit/${id}.webm`;

  try {
    const response = await axios.get(audio.url, { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(existingAudioPath));

    const timings = parseNewFloat(audio.word, audio.word);

    outputPath = await deleteAudio(
      existingAudioPath,
      timings.start,
      timings.end,
      id
    );

    const storagePath = `${user}/${audio.projectName}/edits/${audio.editId}.webm`;

    await projectBucket.upload(outputPath, {
      destination: storagePath,
      metadata: {
        cacheControl: 'private, max-age=0, no-transform',
      },
    });

    const editedFile = projectBucket.file(storagePath);

    await fs.promises.unlink(existingAudioPath);
    await fs.promises.unlink(outputPath);

    res.status(200).json({ url: editedFile.publicUrl(), id: audio.editId });
  } catch (e) {
    console.log(e);
    return res.status(404).json(e);
  }
};

export {
  editAudio,
  deleteEdits,
  saveAudio,
  editAudioWithExisting,
  addNewWord,
  deleteWord,
};
