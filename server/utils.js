import jwt from 'jsonwebtoken';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import fs from 'fs';
import path, { format } from 'path';

const __dirname = path.resolve();

/**
 * creates a new jwt token
 * @param {string} user data to be encrypted
 * @param {object} options options arguments for jwt
 * @returns new jwt token string
 */
export function generateToken(user, options = {}) {
  return jwt.sign({ user }, process.env.JWT_SECRET, options);
}

export function authorize(req, res, next) {
  console.log('authorizing 🔃');

  if (req.headers['authorization'] == null) {
    return res.status(403).json({ message: 'Please provide authorization' });
  }
  const authHeader = req.headers.authorization;

  const accessToken = authHeader && authHeader.split(' ')[1];

  if (accessToken == null)
    return res.status(400).send({ message: 'Please providetoken' });

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ err });
    req.user = user;
    console.log('successfully authorized ✅');
    next();
  });
}

const ffmpeg = createFFmpeg({ log: true });

/**
 * Converts video files to mp3
 * @param {String} pathToVideo path to video file
 * @param {String} filename filename of the current video file
 * @param {String} newName string value for the new file name
 * @returns {Promise}  a path String of the new mp3 file. default directory:__dirname/temp/converted/.mp3
 */
export async function convertToMp3(pathToVideo, filename, newName) {
  const newPath = `${__dirname}/temp/converted/${newName}Audio.webm`;

  try {
    await fs.promises.mkdir(`${__dirname}/temp/converted/`, {
      recursive: true,
    });

    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    ffmpeg.FS('writeFile', `${filename}`, await fetchFile(pathToVideo));

    await ffmpeg.run(
      '-i',
      `${filename}`,
      '-q:a',
      '0',
      '-map',
      'a?',
      `${newName}Audio.webm`
    );

    await fs.promises.writeFile(
      newPath,
      ffmpeg.FS('readFile', `${newName}Audio.webm`)
    );

    return newPath;
  } catch (e) {
    return null;
  }
}

export async function cutAudio(
  path,
  newAudioPath,
  start,
  end,
  projectName,
  duration
) {
  const outputPath = `${__dirname}/temp/edit/${projectName}Output.webm`;
  try {
    await fs.promises.mkdir(`${__dirname}/temp/edit/`, { recursive: true });

    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    ffmpeg.FS('writeFile', `${projectName}.webm`, await fetchFile(path));

    ffmpeg.FS(
      'writeFile',
      `${projectName}Edit.webm`,
      await fetchFile(newAudioPath)
    );

    await ffmpeg.run(
      '-ss',
      `00:00:00`,
      '-i',
      `${projectName}.webm`,
      '-t',
      formatTime(start),
      `${projectName}1.webm`
    );
    await ffmpeg.run(
      '-ss',
      formatTime(end),
      '-i',
      `${projectName}.webm`,
      `${projectName}2.webm`
    );

    await ffmpeg.run(
      '-i',
      `${projectName}1.webm`,
      '-i',
      `${projectName}Edit.webm`,
      '-i',
      `${projectName}2.webm`,
      '-filter_complex',
      '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]',
      '-map',
      '[out]',
      `${projectName}Output.webm`
    );

    await fs.promises.writeFile(
      outputPath,
      ffmpeg.FS('readFile', `${projectName}Output.webm`)
    );

    ffmpeg.FS('unlink', `${projectName}Output.webm`);
    ffmpeg.FS('unlink', `${projectName}2.webm`);
    ffmpeg.FS('unlink', `${projectName}1.webm`);
    ffmpeg.FS('unlink', `${projectName}Edit.webm`);
    return outputPath;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function extractAudio(
  path,
  start,
  end,
  duration,
  originatorWordStart,
  originatorWordEnd,
  projectName
) {
  try {
    const outputPath = `${__dirname}/temp/edit/${projectName}ExistingWordOutput.webm`;

    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    ffmpeg.FS('writeFile', `${projectName}Audio.webm`, await fetchFile(path));

    await ffmpeg.run(
      '-i',
      `${projectName}Audio.webm`,
      '-ss',
      `${formatTime(originatorWordStart)}`,
      '-to',
      `${formatTime(originatorWordEnd)}`,
      `${projectName}Word.webm`
    );

    await ffmpeg.run(
      '-ss',
      `00:00:00`,
      '-i',
      `${projectName}Audio.webm`,
      '-t',
      formatTime(start),
      `${projectName}1.webm`
    );

    await ffmpeg.run(
      '-ss',
      formatTime(end),
      '-i',
      `${projectName}Audio.webm`,
      `${projectName}2.webm`
    );

    await ffmpeg.run(
      '-i',
      `${projectName}1.webm`,
      '-i',
      `${projectName}Word.webm`,
      '-i',
      `${projectName}2.webm`,
      '-filter_complex',
      '[0:a][1:a][2:a]concat=n=3:v=0:a=1',
      `${projectName}Output.webm`
    );

    await fs.promises.writeFile(
      outputPath,
      ffmpeg.FS('readFile', `${projectName}Output.webm`)
    );

    ffmpeg.FS('unlink', `${projectName}Output.webm`);
    ffmpeg.FS('unlink', `${projectName}2.webm`);
    ffmpeg.FS('unlink', `${projectName}1.webm`);
    ffmpeg.FS('unlink', `${projectName}Word.webm`);

    return outputPath;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function addNewAudioExtract(
  path,
  cut,
  originatorWordStart,
  originatorWordEnd,
  projectName
) {
  try {
    const outputPath = `${__dirname}/temp/edit/${projectName}ExistingWordOutput.webm`;

    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    ffmpeg.FS('writeFile', `${projectName}Audio.webm`, await fetchFile(path));

    await ffmpeg.run(
      '-i',
      `${projectName}Audio.webm`,
      '-ss',
      `${formatTime(originatorWordStart)}`,
      '-to',
      `${formatTime(originatorWordEnd)}`,
      `${projectName}Word.webm`
    );

    await ffmpeg.run(
      '-ss',
      `00:00:00`,
      '-i',
      `${projectName}Audio.webm`,
      '-t',
      formatTime(cut),
      `${projectName}1.webm`
    );

    await ffmpeg.run(
      '-ss',
      formatTime(cut),
      '-i',
      `${projectName}Audio.webm`,
      `${projectName}2.webm`
    );

    await ffmpeg.run(
      '-i',
      `${projectName}1.webm`,
      '-i',
      `${projectName}Word.webm`,
      '-i',
      `${projectName}2.webm`,
      '-filter_complex',
      '[0:a][1:a][2:a]concat=n=3:v=0:a=1',
      `${projectName}Output.webm`
    );

    await fs.promises.writeFile(
      outputPath,
      ffmpeg.FS('readFile', `${projectName}Output.webm`)
    );

    ffmpeg.FS('unlink', `${projectName}Output.webm`);
    ffmpeg.FS('unlink', `${projectName}2.webm`);
    ffmpeg.FS('unlink', `${projectName}1.webm`);
    ffmpeg.FS('unlink', `${projectName}Word.webm`);

    return outputPath;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function AddNewAudioCut(path, newAudioPath, cut, projectName) {
  const outputPath = `${__dirname}/temp/edit/${projectName}Output.webm`;
  try {
    await fs.promises.mkdir(`${__dirname}/temp/edit/`, { recursive: true });

    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    ffmpeg.FS('writeFile', `${projectName}.webm`, await fetchFile(path));

    ffmpeg.FS(
      'writeFile',
      `${projectName}Edit.webm`,
      await fetchFile(newAudioPath)
    );

    await ffmpeg.run(
      '-ss',
      `00:00:00`,
      '-i',
      `${projectName}.webm`,
      '-t',
      formatTime(cut),
      `${projectName}1.webm`
    );
    await ffmpeg.run(
      '-ss',
      formatTime(cut),
      '-i',
      `${projectName}.webm`,
      `${projectName}2.webm`
    );

    await ffmpeg.run(
      '-i',
      `${projectName}1.webm`,
      '-i',
      `${projectName}Edit.webm`,
      '-i',
      `${projectName}2.webm`,
      '-filter_complex',
      '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]',
      '-map',
      '[out]',
      `${projectName}Output.webm`
    );

    await fs.promises.writeFile(
      outputPath,
      ffmpeg.FS('readFile', `${projectName}Output.webm`)
    );

    ffmpeg.FS('unlink', `${projectName}Output.webm`);
    ffmpeg.FS('unlink', `${projectName}2.webm`);
    ffmpeg.FS('unlink', `${projectName}1.webm`);
    ffmpeg.FS('unlink', `${projectName}Edit.webm`);
    return outputPath;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function deleteAudio(path, start, end, id) {
  const outputPath = `${__dirname}/temp/edit/${id}Output.webm`;

  try {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    ffmpeg.FS('writeFile', `${id}.webm`, await fetchFile(path));
    await ffmpeg.run(
      '-ss',
      `00:00:00`,
      '-i',
      `${id}.webm`,
      '-t',
      formatTime(start),

      `${id}1.webm`
    );
    await ffmpeg.run('-ss', formatTime(end), '-i', `${id}.webm`, `${id}2.webm`);

    await ffmpeg.run(
      '-i',
      `${id}1.webm`,
      '-i',
      `${id}2.webm`,
      '-filter_complex',
      '[0:0][1:0]concat=n=2:v=0:a=1[out]',
      '-map',
      '[out]',
      `${id}Output.webm`
    );

    await fs.promises.writeFile(
      outputPath,
      ffmpeg.FS('readFile', `${id}Output.webm`)
    );

    ffmpeg.FS('unlink', `${id}Output.webm`);
    ffmpeg.FS('unlink', `${id}2.webm`);
    ffmpeg.FS('unlink', `${id}1.webm`);
    return outputPath;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export function formatTime(seconds = 0) {
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const newSeconds = (seconds % 60).toFixed(3).toString().padStart(6, '0');
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  return `${hours || '00'}:${minutes || '00'}:${
    newSeconds || seconds.toString().padStart(6, '0')
  }`;
}

export function parseNewFloat(start, end) {
  const newStart = parseFloat(
    `${(start.startTime.seconds && start.startTime.seconds) || '00'}.${
      start.startTime.nanos && start.startTime.nanos / 100000
    }`
  );

  const newEnd = parseFloat(
    `${(end.endTime.seconds && end.endTime.seconds) || '00'}.${
      end.endTime.nanos && end.endTime.nanos / 100000
    }`
  );

  return { start: newStart, end: newEnd };
}
