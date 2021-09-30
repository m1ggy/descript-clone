import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

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

export async function configureCors(bucket) {
  await bucket.setCorsConfiguration([
    {
      origin: ['*'],
      responseHeader: ['Content-Type', 'Access-Control-Allow-Origin'],
      method: ['GET', 'HEAD', 'DELETE', 'OPTIONS'],
    },
  ]);

  async function createTempDir() {
    await fs.promises.mkdir(`${__dirname}/temp/`, { recursive: true });
  }

  createTempDir();

  await bucket.makePublic();
}

configureCors(projectBucket);

export default projectBucket;
