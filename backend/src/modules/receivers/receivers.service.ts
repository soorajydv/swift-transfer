import prisma from '../../config/prisma';
import { ServiceResult, IReceiverAttributes, ICreateReceiverData, IUpdateReceiverData, IReceiverData } from './receivers.types';
import { generateId } from '../../utils/helpers';

export class ReceiversService {
  static async createReceiver(data: ICreateReceiverData): Promise<ServiceResult<IReceiverData>> {
    try {
      // Check if sender exists
      const sender = await prisma.sender.findUnique({
        where: { id: data.senderId }
      });

      if (!sender) {
        return {
          success: false,
          message: 'Sender not found',
          error: 'Sender not found',
          statusCode: 404
        };
      }

      const receiverData: any = {
        id: generateId('RCV'),
        senderId: data.senderId,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        relationship: data.relationship,
        bankName: data.bankName,
        bankBranch: data.bankBranch,
        accountNumber: data.accountNumber,
        status: data.status || 'active'
      };

      if (data.email !== undefined) {
        receiverData.email = data.email;
      }

      const receiver = await prisma.receiver.create({
        data: receiverData
      });

      return {
        success: true,
        data: this.formatReceiver(receiver as IReceiverAttributes),
        message: 'Receiver created successfully'
      };
    } catch (error) {
      console.error('Error creating receiver:', error);
      return {
        success: false,
        message: 'Failed to create receiver',
        error: 'Failed to create receiver',
        statusCode: 500
      };
    }
  }

  static async getAllReceivers(filters?: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    status?: string | undefined;
    senderId?: string | undefined;
    bank?: string | undefined;
    city?: string | undefined;
  }): Promise<ServiceResult<{ items: IReceiverData[]; total: number; page: number; limit: number }>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.senderId) {
        where.senderId = filters.senderId;
      }

      if (filters?.bank) {
        where.bankName = filters.bank;
      }

      if (filters?.city) {
        where.city = filters.city;
      }

      if (filters?.search) {
        where.OR = [
          { fullName: { contains: filters.search } },
          { email: { contains: filters.search } },
          { phone: { contains: filters.search } },
          { bankName: { contains: filters.search } },
          { city: { contains: filters.search } },
          { relationship: { contains: filters.search } }
        ];
      }

      const [receivers, total] = await Promise.all([
        prisma.receiver.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        // Use findMany to count since count() doesn't support mode parameter
        prisma.receiver.findMany({
          where,
          select: { id: true }
        }).then(results => results.length)
      ]);

      return {
        success: true,
        message: 'Receivers retrieved successfully',
        data: {
          items: receivers.map(receiver => this.formatReceiver(receiver as IReceiverAttributes)),
          total,
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Error fetching receivers:', error);
      return {
        success: false,
        message: 'Failed to fetch receivers',
        error: 'Failed to fetch receivers',
        statusCode: 500
      };
    }
  }

  static async getReceiverById(id: string): Promise<ServiceResult<IReceiverData>> {
    try {
      const receiver = await prisma.receiver.findUnique({
        where: { id }
      });

      if (!receiver) {
        return {
          success: false,
          message: 'Receiver not found',
          error: 'Receiver not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        message: 'Receiver retrieved successfully',
        data: this.formatReceiver(receiver as IReceiverAttributes)
      };
    } catch (error) {
      console.error('Error fetching receiver:', error);
      return {
        success: false,
        message: 'Failed to fetch receiver',
        error: 'Failed to fetch receiver',
        statusCode: 500
      };
    }
  }

  static async updateReceiver(id: string, data: IUpdateReceiverData, updatedBy?: string): Promise<ServiceResult<IReceiverData>> {
    try {
      const receiver = await prisma.receiver.findUnique({
        where: { id }
      });

      if (!receiver) {
        return {
          success: false,
          message: 'Receiver not found',
          error: 'Receiver not found',
          statusCode: 404
        };
      }

      const updateData: any = { ...data };
      if (updatedBy !== undefined) {
        updateData.updatedBy = updatedBy;
      }

      const updatedReceiver = await prisma.receiver.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        data: this.formatReceiver(updatedReceiver as IReceiverAttributes),
        message: 'Receiver updated successfully'
      };
    } catch (error) {
      console.error('Error updating receiver:', error);
      return {
        success: false,
        message: 'Failed to update receiver',
        error: 'Failed to update receiver',
        statusCode: 500
      };
    }
  }

  static async deactivateReceiver(id: string, updatedBy?: string): Promise<ServiceResult<IReceiverData>> {
    return this.updateReceiver(id, { status: 'inactive' }, updatedBy);
  }

  static async deleteReceiver(id: string): Promise<ServiceResult> {
    try {
      const receiver = await prisma.receiver.findUnique({
        where: { id }
      });

      if (!receiver) {
        return {
          success: false,
          message: 'Receiver not found',
          error: 'Receiver not found',
          statusCode: 404
        };
      }

      await prisma.receiver.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Receiver deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting receiver:', error);
      return {
        success: false,
        message: 'Failed to delete receiver',
        error: 'Failed to delete receiver',
        statusCode: 500
      };
    }
  }

  static async getReceiversBySenderId(senderId: string): Promise<ServiceResult<IReceiverData[]>> {
    try {
      const receivers = await prisma.receiver.findMany({
        where: { senderId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        message: 'Receivers retrieved successfully',
        data: receivers.map(receiver => this.formatReceiver(receiver as IReceiverAttributes))
      };
    } catch (error) {
      console.error('Error fetching receivers by sender:', error);
      return {
        success: false,
        message: 'Failed to fetch receivers',
        error: 'Failed to fetch receivers',
        statusCode: 500
      };
    }
  }

  private static formatReceiver(receiver: IReceiverAttributes): IReceiverData {
    return {
      id: receiver.id,
      senderId: receiver.senderId,
      fullName: receiver.fullName,
      email: receiver.email as string,
      phone: receiver.phone,
      address: receiver.address,
      city: receiver.city,
      country: receiver.country,
      relationship: receiver.relationship,
      bankName: receiver.bankName,
      bankBranch: receiver.bankBranch,
      accountNumber: receiver.accountNumber,
      status: receiver.status,
      createdAt: receiver.createdAt.toISOString(),
      updatedAt: receiver.updatedAt.toISOString(),
      createdBy: receiver.createdBy,
      updatedBy: receiver.updatedBy
    };
  }
}
