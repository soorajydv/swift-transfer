import express from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { ReceiversController } from '../modules/receivers/receivers.controller';
import { createReceiverSchema, updateReceiverSchema, getReceiversSchema, receiverIdSchema, deactivateReceiverSchema, getReceiversBySenderSchema } from '../modules/receivers/receivers.validation';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/',
  validateRequest(getReceiversSchema),
  ReceiversController.getAllReceivers
);

router.post('/',
  validateRequest(createReceiverSchema),
  ReceiversController.createReceiver
);

router.get('/:id',
  validateRequest(receiverIdSchema),
  ReceiversController.getReceiverById
);

router.put('/:id',
  validateRequest(updateReceiverSchema),
  ReceiversController.updateReceiver
);

router.patch('/:id/deactivate',
  validateRequest(deactivateReceiverSchema),
  ReceiversController.deactivateReceiver
);

router.delete('/:id',
  validateRequest(receiverIdSchema),
  ReceiversController.deleteReceiver
);

router.get('/sender/:senderId',
  validateRequest(getReceiversBySenderSchema),
  ReceiversController.getReceiversBySenderId
);

export default router;
