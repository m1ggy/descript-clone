import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import axios from 'axios';
import { cutAudio, formatTime } from '../utils';
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

///storage
const gc = new Storage({
  keyFilename: `../descript-clone-d821ff774d24.json`,
  projectId: 'descript-clone',
});
const projectBucket = gc.bucket('project-files-dc');

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
        `${json.start.seconds && json.start.seconds}.${
          json.start.nanos && json.start.nanos / 10000000
        }`
      );
      const end = parseFloat(
        `${json.end.seconds && json.end.seconds}.${
          json.end.nanos && json.end.nanos / 10000000
        }`
      );

      console.log(formatTime(start));
      console.log(formatTime(end));
      console.log(formatTime(json.duration));

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

      await projectBucket.upload(outputPath, { destination: storagePath });

      return res.status(200).send();
    } catch (e) {
      console.log(e);
      return res.status(400).json(e);
    }
  },
];

export { editAudio };
