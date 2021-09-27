import express from 'express';
import { exportProject } from '../controllers/exportController';
import { fetchExportedProject } from '../controllers/projectController';
import { authorize } from '../utils';
const router = express.Router();

router.get('/:id', authorize, exportProject);

router.get('/:id/exported', fetchExportedProject);

export default router;
