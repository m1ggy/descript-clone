import express from 'express';
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { authorize } from '../utils.js';
import userModel from '../models/user.js';

const __dirname = path.resolve();
///router
const router = express.Router();

///storage
const gc = new Storage({
  keyFilename: `../descript-clone-d821ff774d24.json`,
  projectId: 'descript-clone',
});
const projectBucket = gc.bucket('project-files-dc');

///multer
const storage = multer();

//routes
router.post('/', async (req, res) => {
  const {
    user: { user },
  } = req;
  const { projectName } = req.body;

  if (projectName == null)
    return res.send(404).json({ message: 'project name is not provided.' });

  ///create local text file
  const path = `${__dirname}/temp/${projectName}.txt`;

  fs.writeFile(path, '', (err) => {
    if (err) return res.status(400).json({ message: 'An error occurred', err });
    console.log('created text file');
  });

  try {
    const currentUser = await userModel.findOne({ username: user }).exec();

    if (currentUser == null)
      return res.status(404).json({ message: 'User does not exist' });
  } catch (e) {
    return res.status(404).json({ message: 'An error occurred', e });
  }

  const destination = `${user}/${projectName}/${projectName}.txt`;

  const exists = await projectBucket
    .file(destination)
    .exists()
    .catch(console.error);

  if (exists[0] === false) {
    ///add project to user directory
    await projectBucket
      .upload(path, {
        destination,
      })
      .catch(console.error);
    console.log(`Uploaded file ${projectName}.txt`);

    ///add to new project to db
    try {
      await userModel
        .findOneAndUpdate(
          { username: user },
          { $push: { projects: { name: projectName, createdAt: new Date() } } }
        )
        .exec();
      console.log('added project to DB');
    } catch (e) {
      console.error(e);
    }

    res.status(200).json({ message: 'created new project' });
  } else {
    res.status(400).json({ message: 'Project already exist.' });
  }
  ///delete temp file
  fs.unlink(path, (err) => {
    if (err) throw err;
    console.log('deleted temp file');
  });
});

////check if the project already exists
router.post('/check', async (req, res) => {
  const { projectName } = req.body;
  const {
    user: { user },
  } = req;
  const destination = `${user}/${projectName}/${projectName}.txt`;

  const exists = await projectBucket
    .file(destination)
    .exists()
    .catch(console.error);

  if (exists[0] === true)
    return res
      .status(400)
      .json({ message: `You already have a project named ${projectName}` });

  return res.status(200).json({ message: 'Project name is available' });
});

export default router;
