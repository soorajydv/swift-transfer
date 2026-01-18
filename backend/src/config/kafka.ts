import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import logger from '../utils/logger';

let kafka: Kafka;
let producer: Producer;
let consumer: Consumer;

export const connectKafka = async (): Promise<void> => {
  try {
    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'swift-transfer-backend',
      brokers,
      logLevel: logLevel.ERROR,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    logger.info('Kafka client initialized');
  } catch (error) {
    logger.error('Failed to initialize Kafka client:', error);
    throw error;
  }
};

export const getKafkaClient = (): Kafka => {
  if (!kafka) {
    throw new Error('Kafka client not initialized');
  }
  return kafka;
};

// Producer functions
export const createProducer = async (): Promise<Producer> => {
  if (!kafka) {
    throw new Error('Kafka client not initialized');
  }

  producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
  });

  producer.on('producer.disconnect', () => {
    logger.warn('Kafka producer disconnected');
  });

  producer.on('producer.connect', () => {
    logger.info('Kafka producer connected');
  });

  await producer.connect();
  return producer;
};

export const getProducer = (): Producer => {
  if (!producer) {
    throw new Error('Producer not initialized');
  }
  return producer;
};

export const disconnectProducer = async (): Promise<void> => {
  if (producer) {
    await producer.disconnect();
    logger.info('Kafka producer disconnected');
  }
};

// Consumer functions
export const createConsumer = async (groupId: string): Promise<Consumer> => {
  if (!kafka) {
    throw new Error('Kafka client not initialized');
  }

  consumer = kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    rebalanceTimeout: 60000,
  });

  consumer.on('consumer.disconnect', () => {
    logger.warn('Kafka consumer disconnected');
  });

  consumer.on('consumer.connect', () => {
    logger.info('Kafka consumer connected');
  });

  consumer.on('consumer.crash', (error) => {
    logger.error('Kafka consumer crashed:', error);
  });

  await consumer.connect();
  return consumer;
};

export const getConsumer = (): Consumer => {
  if (!consumer) {
    throw new Error('Consumer not initialized');
  }
  return consumer;
};

export const disconnectConsumer = async (): Promise<void> => {
  if (consumer) {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected');
  }
};

// Message publishing functions
export const publishMessage = async (
  topic: string,
  message: any,
  key?: string
): Promise<void> => {
  try {
    const producer = getProducer();

    await producer.send({
      topic,
      messages: [
        {
          key: key || null,
          value: JSON.stringify(message),
          headers: {
            timestamp: new Date().toISOString(),
            source: 'swift-transfer-backend',
          },
        },
      ],
    });

    logger.debug(`Message published to topic ${topic}:`, message);
  } catch (error) {
    logger.error(`Failed to publish message to topic ${topic}:`, error);
    throw error;
  }
};

export const publishBatchMessages = async (
  topic: string,
  messages: Array<{ key?: string; value: any }>
): Promise<void> => {
  try {
    const producer = getProducer();

    const kafkaMessages = messages.map((msg) => ({
      key: msg.key || null,
      value: JSON.stringify(msg.value),
      headers: {
        timestamp: new Date().toISOString(),
        source: 'swift-transfer-backend',
      },
    }));

    await producer.send({
      topic,
      messages: kafkaMessages,
    });

    logger.debug(`Batch of ${messages.length} messages published to topic ${topic}`);
  } catch (error) {
    logger.error(`Failed to publish batch messages to topic ${topic}:`, error);
    throw error;
  }
};

// Consumer subscription functions
export const subscribeToTopic = async (
  topic: string,
  messageHandler: (message: any) => Promise<void>,
  groupId?: string
): Promise<void> => {
  try {
    const consumer = groupId
      ? await createConsumer(groupId)
      : getConsumer();

    await consumer.subscribe({
      topic,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value ? JSON.parse(message.value.toString()) : null;
          const key = message.key ? message.key.toString() : null;

          logger.debug(`Received message from topic ${topic}:`, { key, value });

          await messageHandler({
            topic,
            partition,
            key,
            value,
            headers: message.headers,
            timestamp: message.timestamp,
          });
        } catch (error) {
          logger.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });

    logger.info(`Subscribed to topic: ${topic}`);
  } catch (error) {
    logger.error(`Failed to subscribe to topic ${topic}:`, error);
    throw error;
  }
};

// Transaction events
export const publishUserCreatedEvent = async (user: any): Promise<void> => {
  await publishMessage('user-events', {
    event: 'USER_CREATED',
    userId: user.id,
    email: user.email,
    role: user.role,
    timestamp: new Date().toISOString(),
  }, user.id);
};

export const publishUserUpdatedEvent = async (user: any): Promise<void> => {
  await publishMessage('user-events', {
    event: 'USER_UPDATED',
    userId: user.id,
    email: user.email,
    changes: user._changed,
    timestamp: new Date().toISOString(),
  }, user.id);
};

export const publishOTPRequestedEvent = async (email: string): Promise<void> => {
  await publishMessage('auth-events', {
    event: 'OTP_REQUESTED',
    email,
    timestamp: new Date().toISOString(),
  }, email);
};

export const publishOTPVerifiedEvent = async (email: string, userId: string): Promise<void> => {
  await publishMessage('auth-events', {
    event: 'OTP_VERIFIED',
    email,
    userId,
    timestamp: new Date().toISOString(),
  }, userId);
};

export const publishLoginEvent = async (userId: string, email: string): Promise<void> => {
  await publishMessage('auth-events', {
    event: 'USER_LOGIN',
    userId,
    email,
    timestamp: new Date().toISOString(),
  }, userId);
};

export const disconnectKafka = async (): Promise<void> => {
  try {
    await disconnectProducer();
    await disconnectConsumer();
    logger.info('Kafka connections closed');
  } catch (error) {
    logger.error('Error disconnecting Kafka:', error);
  }
};

// Note: kafka instance is not exported by default as it's initialized asynchronously
