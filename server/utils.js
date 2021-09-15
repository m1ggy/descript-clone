import jwt from 'jsonwebtoken';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import fs from 'fs';
import path, { resolve } from 'path';

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

/**
 * Converts video files to mp3
 * @param {String} pathToVideo path to video file
 * @param {String} filename filename of the current video file
 * @param {String} newName string value for the new file name
 * @returns {Promise}  a path String of the new mp3 file. default directory:__dirname/temp/converted/.mp3
 */
export async function convertToMp3(pathToVideo, filename, newName) {
  const ffmpeg = createFFmpeg();
  const newPath = `${__dirname}/temp/converted/${newName}.mp3`;

  try {
    await fs.promises.mkdir(`${__dirname}/temp/converted/`, {
      recursive: true,
    });
    await ffmpeg.load();

    ffmpeg.FS('writeFile', `${filename}`, await fetchFile(pathToVideo));

    await ffmpeg.run(
      '-i',
      `${filename}`,
      '-q:a',
      '0',
      '-map',
      'a?',
      `${newName}.mp3`
    );

    await fs.promises.writeFile(
      newPath,
      ffmpeg.FS('readFile', `${newName}.mp3`)
    );

    return newPath;
  } catch (e) {
    return null;
  }
}
