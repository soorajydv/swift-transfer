import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { TransactionsController } from '../modules/transactions/transactions.controller';
import { createTransactionSchema, getTransactionsSchema, getTransactionStatsSchema, transactionIdSchema, updateTransactionStatusSchema, cancelTransactionSchema } from '../modules/transactions/transactions.validation';

const router = express.Router();

router.use(authenticate);

router.get('/',
  validateRequest(getTransactionsSchema),
  TransactionsController.getAllTransactions
);

router.post('/',
  validateRequest(createTransactionSchema),
  TransactionsController.createTransaction
);

router.get('/stats',
  validateRequest(getTransactionStatsSchema),
  TransactionsController.getTransactionStats
);

router.get('/:id',
  validateRequest(transactionIdSchema),
  TransactionsController.getTransactionById
);

router.patch('/:id/status',
  authorize('ADMIN'),
  validateRequest(updateTransactionStatusSchema),
  TransactionsController.updateTransactionStatus
);

router.patch('/:id/cancel',
  authorize('ADMIN'),
  validateRequest(cancelTransactionSchema),
  TransactionsController.cancelTransaction
);

export default router;
