import express from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { SendersController } from '../modules/senders/senders.controller';
import {
  createSenderSchema,
  updateSenderSchema,
  getSendersSchema,
  senderIdSchema,
  deactivateSenderSchema
} from '../modules/senders/senders.validation';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/',
  validateRequest(getSendersSchema),
  SendersController.getAllSenders
);

router.post('/',
  validateRequest(createSenderSchema),
  SendersController.createSender
);

router.get('/:id',
  validateRequest(senderIdSchema),
  SendersController.getSenderById
);

router.put('/:id',
  validateRequest(updateSenderSchema),
  SendersController.updateSender
);

router.patch('/:id/deactivate',
  validateRequest(deactivateSenderSchema),
  SendersController.deactivateSender
);

router.delete('/:id',
  validateRequest(senderIdSchema),
  SendersController.deleteSender
);

export default router;
