import { authorize } from '../utils.js';
import express from 'express';
import { login, signup, fetchUser } from '../controllers/authController.js';
const routes = express.Router();

routes.post('/login', login);

routes.post('/signup', signup);

routes.get('/', authorize, fetchUser);

export default routes;
