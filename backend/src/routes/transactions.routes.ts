import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { TransactionsController } from '../modules/transactions/transactions.controller';
import { createTransactionSchema, getTransactionsSchema, getTransactionStatsSchema, transactionIdSchema, updateTransactionStatusSchema, cancelTransactionSchema } from '../modules/transactions/transactions.validation';

const router = express.Router();

router.use(authenticate);

router.get('/',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getTransactionsSchema),
  TransactionsController.getAllTransactions
);

router.post('/',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(createTransactionSchema),
  TransactionsController.createTransaction
);

router.get('/stats',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(getTransactionStatsSchema),
  TransactionsController.getTransactionStats
);

router.get('/:id',
  authorize('ADMIN', 'OPERATOR', 'VIEWER'),
  validateRequest(transactionIdSchema),
  TransactionsController.getTransactionById
);

router.patch('/:id/status',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(updateTransactionStatusSchema),
  TransactionsController.updateTransactionStatus
);

router.patch('/:id/cancel',
  authorize('ADMIN', 'OPERATOR'),
  validateRequest(cancelTransactionSchema),
  TransactionsController.cancelTransaction
);

export default router;
