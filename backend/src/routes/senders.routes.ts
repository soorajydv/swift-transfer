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

router.get('/',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getSendersSchema),
  SendersController.getAllSenders
);

router.post('/',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(createSenderSchema),
  SendersController.createSender
);

router.get('/:id',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(senderIdSchema),
  SendersController.getSenderById
);

router.put('/:id',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(updateSenderSchema),
  SendersController.updateSender
);

router.patch('/:id/deactivate',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(deactivateSenderSchema),
  SendersController.deactivateSender
);

router.delete('/:id',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(senderIdSchema),
  SendersController.deleteSender
);

export default router;
