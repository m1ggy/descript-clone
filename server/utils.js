import jwt from 'jsonwebtoken';

export function generateToken(user) {
  return jwt.sign({ user }, process.env.JWT_SECRET, {});
}

export function authorize(req, res, next) {
  console.log('authorizing 🔃');
  console.log(req.headers);
  if (req.headers['authorization'] == null) {
    return res.status(403).json({ message: 'Please provide authorization' });
  }
  const authHeader = req.headers.authorization;

  const accessToken = authHeader && authHeader.split(' ')[1];

  if (accessToken == null)
    return res.status(400).send({ message: 'Please providetoken' });

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ err });
    req.user = user;
    console.log('successfully authorized ✅');
    next();
  });
}
