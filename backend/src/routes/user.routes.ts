import express from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { UserController } from '../modules/user/user.controller';
import { createUserSchema, updateUserSchema, getUserSchema, listUsersSchema, deleteUserSchema } from '../modules/user/user.validation';

const router = express.Router();

router.use(authenticate);

router.post('/',
  authorize('ADMIN'),
  validateRequest(createUserSchema),
  UserController.createUser
);

router.get('/',
  authorize('ADMIN'),
  validateRequest(listUsersSchema),
  UserController.listUsers
);

router.get('/:id',
  authorize('ADMIN'),
  validateRequest(getUserSchema),
  UserController.getUserById
);

router.put('/:id',
  authorize('ADMIN'),
  validateRequest(updateUserSchema),
  UserController.updateUser
);

router.delete('/:id',
  authorize('ADMIN'),
  validateRequest(deleteUserSchema),
  UserController.deleteUser
);

export default router;
