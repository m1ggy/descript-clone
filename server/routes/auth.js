import express from 'express';
import { authorize, generateToken } from '../utils.js';
import bcrypt from 'bcrypt';
import user from '../models/user.js';
const routes = express.Router();

routes.post('/login', async (req, res) => {
  if (req.body == null)
    return res
      .status(400)
      .json({ message: 'Please provide username and password.' });

  const { username, password } = req.body;
  try {
    const existingUser = await user.findOne({ username }).exec();
    if (existingUser == null)
      return res.status(400).json({ message: 'user does not exist.' });

    if (await bcrypt.compare(password, existingUser.password)) {
      const token = generateToken(username);
      return res
        .status(200)
        .json({
          message: 'logged in.',
          token,
          projects: existingUser.projects,
        });
    }

    return res.status(400).json({ message: 'Wrong password' });
  } catch (e) {
    return res.status(400).json({ message: `An error occurred: ${e}` });
  }
});

routes.post('/signup', async (req, res) => {
  if (req.body == null)
    return res.status(400).json({ message: 'Please provide info!' });

  const { username, password } = req.body;

  if (username == null || password == null)
    return res.status(400).json({ message: 'Please provide info!' });
  try {
    const existingUser = await user.findOne({ username }).exec();
    if (existingUser)
      return res
        .status(404)
        .json({ message: 'username is taken.', valid: false });
  } catch (e) {
    return res.status(400).json({ message: `An error occurred: ${e}` });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({ username, password: hashedPassword });
    await newUser.save();
  } catch (e) {
    return res.status(400).json({ message: `An error occurred: ${e}` });
  }
  const token = generateToken(username);

  return res.status(200).json({ message: 'Account created', token });
});

export default routes;
