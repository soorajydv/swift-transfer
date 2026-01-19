import express from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { ReceiversController } from '../modules/receivers/receivers.controller';
import { createReceiverSchema, updateReceiverSchema, getReceiversSchema, receiverIdSchema, deactivateReceiverSchema, getReceiversBySenderSchema } from '../modules/receivers/receivers.validation';

const router = express.Router();

router.use(authenticate);

router.get('/',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getReceiversSchema),
  ReceiversController.getAllReceivers
);

router.post('/',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(createReceiverSchema),
  ReceiversController.createReceiver
);

router.get('/:id',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(receiverIdSchema),
  ReceiversController.getReceiverById
);

router.put('/:id',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(updateReceiverSchema),
  ReceiversController.updateReceiver
);

router.patch('/:id/deactivate',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(deactivateReceiverSchema),
  ReceiversController.deactivateReceiver
);

router.delete('/:id',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(receiverIdSchema),
  ReceiversController.deleteReceiver
);

router.get('/sender/:senderId',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getReceiversBySenderSchema),
  ReceiversController.getReceiversBySenderId
);

export default router;
