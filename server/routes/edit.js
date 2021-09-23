import express from 'express';
import {
  deleteEdits,
  editAudio,
  saveAudio,
} from '../controllers/editController';
const router = express.Router();

router.post('/:id', ...editAudio);

router.delete('/:id', deleteEdits);

router.patch('/:id', saveAudio);

export default router;
