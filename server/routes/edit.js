import express from 'express';
import {
  addNewWord,
  deleteEdits,
  deleteWord,
  editAudio,
  editAudioWithExisting,
  saveAudio,
} from '../controllers/editController';
const router = express.Router();

router.post('/:id', ...editAudio);

router.delete('/:id', deleteEdits);

router.patch('/:id', saveAudio);

router.post('/:id/existing', editAudioWithExisting);
router.post('/:id/add', ...addNewWord);

router.post('/:id/delete', deleteWord);

export default router;
