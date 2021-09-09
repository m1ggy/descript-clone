import { generateToken } from '../utils.js';
import bcrypt from 'bcrypt';
import user from '../models/user.js';

export const login = async (req, res) => {
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
      return res.status(200).json({
        message: 'logged in.',
        token,
        projects: existingUser.projects,
        uid: existingUser._id,
      });
    }

    return res.status(400).json({ message: 'Wrong password' });
  } catch (e) {
    return res.status(400).json({ message: `An error occurred: ${e}` });
  }
};

export const signup = async (req, res) => {
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
};

export const fetchUser = async (req, res) => {
  const username = req.user.user;

  try {
    const currentUser = await user.findOne({ username });
    if (currentUser)
      return res
        .status(200)
        .json({ message: 'Fetched user', projects: currentUser.projects });

    return res.status(404).json({ message: 'failed to fetch user' });
  } catch (e) {
    console.log(e);
    return res.status(404).json({ message: 'failed to fetch user', e });
  }
};
