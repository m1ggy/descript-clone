import path from 'path';
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import fs from 'fs';

import projectModel from '../models/project.js';
import userModel from '../models/user.js';

const __dirname = path.resolve();

///storage
const gc = new Storage({
  keyFilename: `../descript-clone-d821ff774d24.json`,
  projectId: 'descript-clone',
});
const projectBucket = gc.bucket('project-files-dc');

///multer
const storage = multer();

export const createProject = async (req, res) => {
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

  const newFile = projectBucket.file(destination);

  const exists = await newFile.exists().catch(console.error);

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
      ///create new project for the db
      const newProject = new projectModel({
        projectName,
        files: {
          transcription: { link: newFile.publicUrl(), createdAt: new Date() },
        },
        owner: user,
      });
      await newProject.save();
      ///add new project to user
      await userModel
        .findOneAndUpdate(
          { username: user },
          { $push: { projects: { projectName, createdAt: new Date() } } }
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
    if (err) return console.log(err);
    console.log('deleted temp file');
  });
};

export const checkProject = async (req, res) => {
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
};

export const deleteProject = async (req, res) => {
  console.log('deleting');
  const projectName = req.body.name;

  const {
    user: { user },
  } = req;

  const destination = `${user}/${projectName}/`;
  try {
    //delete file from storage, project collection and user collection
    let [files] = await projectBucket.getFiles(destination);

    files = files.filter((x) => x.name.includes(`${destination}`));

    console.log(files);

    files.forEach(async (x) => {
      try {
        await x.delete();
      } catch (e) {
        return console.log(e);
      }
    });

    await projectModel.findOneAndDelete({ projectName }).exec();
    await userModel
      .findOneAndUpdate(
        { username: user },
        {
          $pull: {
            projects: {
              projectName,
            },
          },
        }
      )
      .exec();

    return res.status(200).json({ message: 'Deleted project.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to delete project.', e });
  }
};
