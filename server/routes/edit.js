import express from 'express';
import {
  deleteEdits,
  editAudio,
  editAudioWithExisting,
  saveAudio,
} from '../controllers/editController';
const router = express.Router();

router.post('/:id', ...editAudio);

router.delete('/:id', deleteEdits);

router.patch('/:id', saveAudio);

router.post('/:id/existing', editAudioWithExisting);

export default router;
