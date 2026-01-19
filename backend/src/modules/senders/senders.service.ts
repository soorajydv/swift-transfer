import prisma from '../../config/prisma';
import { ServiceResult, ISenderAttributes, ICreateSenderData, IUpdateSenderData, ISenderData } from './senders.types';
import { generateId } from '../../utils/helpers';

export class SendersService {
  static async createSender(data: ICreateSenderData): Promise<ServiceResult<ISenderData>> {
    try {
      // Check if creator exists
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'Creator not found',
          error: 'Creator not found',
          statusCode: 404
        };
      }

      // Check if sender with this email already exists
      const existingSender = await prisma.sender.findFirst({
        where: { email: data.email }
      });

      if (existingSender) {
        return {
          success: false,
          message: 'Sender with this email already exists',
          error: 'Sender with this email already exists',
          statusCode: 409
        };
      }

      const sender = await prisma.sender.create({
        data: {
          id: generateId('SND'),
          ...data,
          status: data.status || 'pending_verification'
        }
      });

      return {
        success: true,
        data: this.formatSender(sender as ISenderAttributes),
        message: 'Sender created successfully'
      };
    } catch (error) {
      console.error('Error creating sender:', error);
      return {
        success: false,
        message: 'Failed to create sender',
        error: 'Failed to create sender',
        statusCode: 500
      };
    }
  }

  static async getAllSenders(filters?: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    status?: string | undefined;
    city?: string | undefined;
  }): Promise<ServiceResult<{ items: ISenderData[]; total: number; page: number; limit: number }>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.city) {
        where.city = filters.city;
      }

      if (filters?.search) {
        where.OR = [
          { fullName: { contains: filters.search } },
          { email: { contains: filters.search } },
          { phone: { contains: filters.search } } // Phone numbers are usually exact match
        ];
      }

      const [senders, total] = await Promise.all([
        prisma.sender.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        // Use findMany to count since count() doesn't support mode parameter
        prisma.sender.findMany({
          where,
          select: { id: true }
        }).then(results => results.length)
      ]);

      return {
        success: true,
        message: 'Senders retrieved successfully',
        data: {
          items: senders.map(sender => this.formatSender(sender as ISenderAttributes)),
          total,
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Error fetching senders:', error);
      return {
        success: false,
        message: 'Failed to fetch senders',
        error: 'Failed to fetch senders',
        statusCode: 500
      };
    }
  }

  static async getSenderById(id: string): Promise<ServiceResult<ISenderData>> {
    try {
      const sender = await prisma.sender.findUnique({
        where: { id }
      });

      if (!sender) {
        return {
          success: false,
          message: 'Sender not found',
          error: 'Sender not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        message: 'Sender retrieved successfully',
        data: this.formatSender(sender as ISenderAttributes)
      };
    } catch (error) {
      console.error('Error fetching sender:', error);
      return {
        success: false,
        message: 'Failed to fetch sender',
        error: 'Failed to fetch sender',
        statusCode: 500
      };
    }
  }

  static async updateSender(id: string, data: IUpdateSenderData, updatedBy?: string): Promise<ServiceResult<ISenderData>> {
    try {
      const sender = await prisma.sender.findUnique({
        where: { id }
      });

      if (!sender) {
        return {
          success: false,
          message: 'Sender not found',
          error: 'Sender not found',
          statusCode: 404
        };
      }

      // Check if email is being changed and if it's already taken
      if (data.email && data.email !== sender.email) {
        const existingSender = await prisma.sender.findFirst({
          where: { email: data.email }
        });

        if (existingSender) {
          return {
            success: false,
            message: 'Sender with this email already exists',
            error: 'Sender with this email already exists',
            statusCode: 409
          };
        }
      }

      const updateData: any = { ...data };
      if (updatedBy !== undefined) {
        updateData.updatedBy = updatedBy;
      }

      const updatedSender = await prisma.sender.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        data: this.formatSender(updatedSender as ISenderAttributes),
        message: 'Sender updated successfully'
      };
    } catch (error) {
      console.error('Error updating sender:', error);
      return {
        success: false,
        message: 'Failed to update sender',
        error: 'Failed to update sender',
        statusCode: 500
      };
    }
  }

  static async deactivateSender(id: string, updatedBy?: string): Promise<ServiceResult<ISenderData>> {
    return this.updateSender(id, { status: 'inactive' }, updatedBy);
  }

  static async deleteSender(id: string): Promise<ServiceResult> {
    try {
      const sender = await prisma.sender.findUnique({
        where: { id }
      });

      if (!sender) {
        return {
          success: false,
          message: 'Sender not found',
          error: 'Sender not found',
          statusCode: 404
        };
      }

      await prisma.sender.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Sender deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting sender:', error);
      return {
        success: false,
        message: 'Failed to delete sender',
        error: 'Failed to delete sender',
        statusCode: 500
      };
    }
  }

  private static formatSender(sender: ISenderAttributes): ISenderData {
    return {
      id: sender.id,
      userId: sender.userId,
      fullName: sender.fullName,
      email: sender.email,
      phone: sender.phone,
      address: sender.address,
      city: sender.city,
      country: sender.country,
      identityType: sender.identityType,
      identityNumber: sender.identityNumber,
      status: sender.status,
      createdAt: sender.createdAt.toISOString(),
      updatedAt: sender.updatedAt.toISOString(),
      createdBy: sender.createdBy,
      updatedBy: sender.updatedBy
    };
  }
}
