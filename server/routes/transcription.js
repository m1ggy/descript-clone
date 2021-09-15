import express from 'express';
import {
  getTranscription,
  createTranscription,
} from '../controllers/transcriptionController';
const router = express.Router();

router.get('/', getTranscription);

router.post('/', createTranscription);

export default router;
