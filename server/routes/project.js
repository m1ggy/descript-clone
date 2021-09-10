import express from 'express';
import {
  createProject,
  checkProject,
  deleteProject,
  getProject,
  updateProject,
  deleteMediaProject,
} from '../controllers/projectController.js';
///router
const router = express.Router();

//routes

////create empty project route
router.post('/', createProject);

////check if the project already exists
router.post('/check', checkProject);

/// delete project
router.delete('/', deleteProject);

///get project files
router.get('/:id', getProject);

///update project
router.post('/:id', ...updateProject);

///delete media files in project
router.delete('/:id/media', deleteMediaProject);

export default router;
