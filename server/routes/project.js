import express from 'express';
import {
  createProject,
  checkProject,
  deleteProject,
} from '../controllers/projectController.js';
///router
const router = express.Router();

//routes

////create empty project route
router.post('/', createProject);

////check if the project already exists
router.post('/check', checkProject);

router.delete('/', deleteProject);

export default router;
