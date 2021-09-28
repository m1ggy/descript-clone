import project from '../models/project';
import fs from 'fs';
import path from 'path';
import { downloadFile, getType, mergeVideoAndAudio } from '../utils';
import storage from '../storage/index';
const __dirname = path.resolve();

async function generateDir() {
  await fs.promises.mkdir(`${__dirname}/temp/export/`, {
    recursive: true,
  });
}
generateDir();

export const exportProject = async (req, res) => {
  try {
    const {
      params: { id },
      user: { user },
    } = req;
    req.setTimeout(6000 * 1000);

    let video = null;
    let audio = null;
    let videoPath = null;
    let audioPath = null;
    let outputPath = null;
    let destination = null;
    let exportFile = null;
    const currentProject = await project.findById(id).exec();
    if (!currentProject) return res.status(400).json('Project does not exist.');

    const {
      files: { media },
    } = currentProject;

    ///video
    [video] = media.filter((x) => x.type.includes('video'));
    ///audio
    [audio] = media.filter((x) => x.type.includes('audio') || x.converted);

    if (video) {
      console.log('video exists');
      videoPath = `${__dirname}/temp/export/${video.name}`;
      await downloadFile(video.url, videoPath);

      if (media.length > 1) {
        console.log('converted audio exists');
        audioPath = `${__dirname}/temp/export/${audio.name}`;
        await downloadFile(audio.url, audioPath);
      }
    } else if (audio) {
      console.log('audio exists');
      audioPath = `${__dirname}/temp/export/${audio.name}`;
      await downloadFile(audio.url, audioPath);
    } else return res.status(403).json();

    if (videoPath && audioPath) {
      const type = getType(video.type);
      console.log(videoPath, audioPath);
      outputPath = await mergeVideoAndAudio(
        videoPath,
        audioPath,
        currentProject.projectName,
        type
      );

      if (!outputPath)
        return res.status(404).json('Cannot merge audio and video files');
      destination = `${user}/${currentProject.projectName}/export/${currentProject.projectName}EXPORT.mp4`;
      await storage.upload(outputPath, {
        destination,
        metadata: {
          cacheControl: 'private, max-age=0, no-transform',
        },
      });
    } else if (videoPath) {
      console.log('video');
      destination = `${user}/${currentProject.projectName}/export/${currentProject.projectName}EXPORT.mp4`;

      await storage.upload(videoPath, {
        destination,
        metadata: {
          cacheControl: 'private, max-age=0, no-transform',
        },
      });
    } else {
      console.log('audio');
      destination = `${user}/${currentProject.projectName}/export/${currentProject.projectName}EXPORT.webm`;
      await storage.upload(audioPath, {
        destination,
        metadata: {
          cacheControl: 'private, max-age=0, no-transform',
        },
      });
    }
    exportFile = storage.file(destination);
    if (!destination) return res.status(405).json();

    console.log('merged audio');
    ///set exported to true
    currentProject.exported = true;
    currentProject.exportedUrl = exportFile.publicUrl();
    await currentProject.save();

    console.log('saved to db');

    if (audioPath) await fs.promises.unlink(audioPath);
    if (videoPath) await fs.promises.unlink(videoPath);
    if (outputPath) await fs.promises.unlink(outputPath);
    if (!exportFile) return res.status(500).json();
    return res.status(200).json({
      url: exportFile.publicUrl(),
      transcription: currentProject.files.json,
    });
  } catch (e) {
    console.log(e);
    return res.status(404).json();
  }
};
