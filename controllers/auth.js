import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

export const register = async (req, res) => {
  const user = await User.create(req.body);
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: {
      user: {
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        location: user.location,
        token,
      },
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Invalid email');
  }

  const isPasswordCorrect = await user.checkPassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid password');
  }

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: {
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        location: user.location,
        token,
      },
    },
  });
};

export const updateUser = async (req, res) => {
  const {
    user: { userId },
    body: { name, lastName, email, location },
  } = req;

  if (!name || !lastName || !email || !location) {
    throw new BadRequestError('All fields are required!');
  }

  const user = await User.findById(userId);

  user.name = name;
  user.lastName = lastName;
  user.email = email;
  user.location = location;

  await user.save();
  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: {
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        location: user.location,
        token,
      },
    },
  });
};
