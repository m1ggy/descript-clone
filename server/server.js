import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/project.js';
import transcriptionRoutes from './routes/transcription';
import editRoutes from './routes/edit';
import { authorize } from './utils.js';
dotenv.config();

mongoose.connect(process.env.DB_URI, (error) => {
  if (error) {
    console.error('failed to start server');
    process.exit(0);
  }
  console.log('connected to mongodb!');
  const app = express();

  //cors
  app.use(
    cors({
      origin: '*',
    })
  );

  //parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //routes
  app.use(authRoutes);
  app.use('/project', authorize, projectRoutes);
  app.use('/transcription', authorize, transcriptionRoutes);
  app.use('/edit', authorize, editRoutes);

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
});
