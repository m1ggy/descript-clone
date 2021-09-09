import express from 'express';
import {
  createProject,
  checkProject,
  deleteProject,
  getProject,
  updateProject,
} from '../controllers/projectController.js';
///router
const router = express.Router();

//routes

////create empty project route
router.post('/', createProject);

////check if the project already exists
router.post('/check', checkProject);

router.delete('/', deleteProject);
router.get('/:id', getProject);
router.post('/:id', ...updateProject);

export default router;
