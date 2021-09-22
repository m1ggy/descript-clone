import express from 'express';
import { editAudio } from '../controllers/editController';
const router = express.Router();

router.post('/:id', ...editAudio);

export default router;
