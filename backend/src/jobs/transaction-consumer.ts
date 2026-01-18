import { subscribeToTopic } from '../config/kafka';
import { TransactionsService } from '../modules/transactions/transactions.service';
import logger from '../utils/logger';

export class TransactionConsumer {
  static async start(): Promise<void> {
    try {
      logger.info('🚀 Starting Transaction Consumer...');

      await subscribeToTopic(
        'transaction-events',
        this.handleTransactionEvent.bind(this),
        'transaction-consumer-group'
      );

      logger.info('✅ Transaction Consumer started successfully');
    } catch (error) {
      logger.error('❌ Failed to start Transaction Consumer:', error);
      throw error;
    }
  }

  private static async handleTransactionEvent(message: any): Promise<void> {
    try {
      const { event, ...data } = message.value;

      logger.info(`📨 Processing transaction event: ${event}`, { transactionId: data.transactionId });

      switch (event) {
        case 'TRANSACTION_CREATED':
          await this.handleTransactionCreated(data);
          break;

        case 'TRANSACTION_UPDATED':
          await this.handleTransactionUpdated(data);
          break;

        case 'TRANSACTION_CANCELLED':
          await this.handleTransactionCancelled(data);
          break;

        default:
          logger.warn(`⚠️ Unknown transaction event type: ${event}`);
      }

      logger.info(`✅ Successfully processed transaction event: ${event}`, { transactionId: data.transactionId });
    } catch (error) {
      logger.error('❌ Error processing transaction event:', error);
      throw error; // Re-throw to mark message as failed
    }
  }

  private static async handleTransactionCreated(data: any): Promise<void> {
    // The transaction is already created in the database by the controller
    // This consumer could be used for additional processing like:
    // - Sending notifications
    // - Updating analytics
    // - Triggering external integrations
    // - Logging audit trails

    logger.info('💰 Transaction created event processed', {
      transactionId: data.transactionId,
      amountJPY: data.amountJPY,
      amountNPR: data.amountNPR,
      senderId: data.senderId,
      receiverId: data.receiverId
    });

    // Example: Could send email notifications, update caches, etc.
    // For now, just log the event
  }

  private static async handleTransactionUpdated(data: any): Promise<void> {
    logger.info('🔄 Transaction updated event processed', {
      transactionId: data.transactionId,
      newStatus: data.status,
      updatedBy: data.updatedBy
    });

    // Additional processing for status updates
  }

  private static async handleTransactionCancelled(data: any): Promise<void> {
    logger.info('❌ Transaction cancelled event processed', {
      transactionId: data.transactionId,
      reason: data.cancelledReason,
      cancelledBy: data.cancelledBy
    });

    // Additional processing for cancellations
  }
}
