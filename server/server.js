import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/project.js';
import { authorize } from './utils.js';
dotenv.config();

mongoose.connect(process.env.DB_URI, (error) => {
  if (error) return console.error(error);
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

  //auth route
  app.use(authRoutes);
  app.use('/project', authorize, projectRoutes);

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
});
