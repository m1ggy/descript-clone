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

////storage cors and public access config
async function configureBucket() {
  await projectBucket.setCorsConfiguration([
    {
      origin: ['http://localhost:3000'],
      responseHeader: [
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Content-Type',
      ],
      method: ['GET', 'HEAD', 'DELETE', 'OPTIONS'],
    },
  ]);
  await projectBucket.makePublic();
}
configureBucket().catch(console.error);

///multer
const upload = multer({ dest: `${__dirname}/temp` });

export const createProject = async (req, res) => {
  const {
    user: { user },
  } = req;
  const { projectName } = req.body;

  if (projectName == null)
    return res.send(404).json({ message: 'project name is not provided.' });

  //common path
  const path = `${__dirname}/temp/${projectName}.txt`;

  ///create local directory
  fs.promises.mkdir(`${__dirname}/temp/`, { recursive: true }, (err) => {
    if (err) throw err;
  });

  ///create local text file
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

  const exists = await newFile.exists().catch((e) => {
    if (e) throw e;
  });

  if (exists[0] === false) {
    ///add project to user directory
    await projectBucket
      .upload(path, {
        destination,
        metadata: {
          cacheControl: 'private, max-age=0, no-transform',
        },
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
          media: [],
        },
        owner: user,
      });
      await newProject.save();
      ///add new project to user

      const project = await projectModel.findOne({ projectName }).exec();

      await userModel
        .findOneAndUpdate(
          { username: user },
          {
            $push: {
              projects: { projectName, createdAt: new Date(), id: project._id },
            },
          }
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
    let [files] = await projectBucket.getFiles();

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
////fetch project
export const getProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await projectModel.findById(id).exec();

    if (!project)
      return res.status(404).json({ message: 'Project does not exist' });

    return res.status(200).json({ message: 'project fetched', project });
  } catch (e) {
    console.log(e);
    return res.status(404).json({ message: 'Failed to fetch project', e });
  }
};
/// update project
export const updateProject = [
  upload.single('media'),
  async (req, res) => {
    const {
      user: { user },
    } = req;
    const { id } = req.params;

    const { projectName } = await projectModel.findById(id).exec();

    const destination = `${user}/${projectName}/${req.file.originalname}`;
    const path = req.file.path;

    try {
      await projectBucket.upload(path, { destination });

      ///delete temp file
      await fs.promises.unlink(req.file.path);

      const newMedia = projectBucket.file(destination);

      await projectModel
        .findByIdAndUpdate(id, {
          $push: {
            'files.media': {
              name: req.file.originalname,
              url: newMedia.publicUrl(),
              type: req.file.mimetype,
              createdAt: new Date(),
            },
          },
        })
        .exec();

      // /return
      return res.status(200).json({ message: 'updated project' });
    } catch (e) {
      return res.status(404).json({ message: 'Failed to update project', e });
    }
  },
];

export const deleteMediaProject = async (req, res) => {
  const {
    user: { user },
    body: { filename },
    params: { id },
  } = req;

  try {
    await projectModel
      .findByIdAndUpdate(id, {
        $pull: { 'files.media': { name: filename } },
      })
      .exec();

    const currentProject = await projectModel.findById(id).exec();

    const path = `${user}/${currentProject.projectName}/${filename}`;

    const fileToDelete = projectBucket.file(path);

    if (await fileToDelete.exists()) {
      await fileToDelete.delete();
      return res.status(200).json({ message: 'Deleted media' });
    } else {
      return res
        .status(404)
        .json({ message: 'Failed to delete media: file does not exist' });
    }
  } catch (e) {
    return res.status(404).json({ message: 'Failed to delete media', e });
  }
};

export const updateTransciption = async (req, res) => {
  const {
    user: { user },
    body: { transcription },
    params: { id },
  } = req;

  console.log(user, transcription, id);
  if (transcription == null || id == null)
    return res.status(400).json({ message: 'Please provide necessary info' });

  try {
    const currentProject = await projectModel.findById(id).exec();

    const path = `${user}/${currentProject.projectName}/${currentProject.projectName}.txt`;
    const localPath = `${__dirname}/temp/${currentProject.projectName}.txt`;

    const currentFile = projectBucket.file(path);

    ///create local text file
    await fs.promises.writeFile(localPath, transcription);

    ///upload new file
    await projectBucket.upload(localPath, {
      destination: path,
      metadata: {
        cacheControl: 'private, max-age=0, no-transform',
      },
    });

    console.log(await currentFile.exists());

    ///update db
    currentProject.files.transcription = {
      ...currentProject.files.transcription,
      link: currentFile.publicUrl(),
      updatedAt: new Date(),
    };

    await currentProject.save();

    ///delete local temp file
    await fs.promises.unlink(localPath);

    return res.status(200).json({ message: 'Updated transcription' });
  } catch (e) {
    return res.status(404).json({ message: 'Failed to update project', e });
  }
};
