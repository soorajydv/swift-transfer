# Swift Transfer Backend - MS SQL Development Guide

## Project Overview

This is a **Money Transfer System** backend built with modern Node.js architecture, adapted for MS SQL Server:

- **Framework**: Express.js with TypeScript
- **Database**: MS SQL Server with Sequelize ORM
- **Validation**: Zod schemas
- **Authentication**: JWT tokens with refresh tokens, OTP-based login
- **Architecture**: Modular layered architecture
- **Message Queue**: Kafka for transaction processing
- **Cache**: Redis for rate limiting and session management

## Backend Architecture

### Core Principles
- **Modular Design**: Each feature is a self-contained module
- **Layer Separation**: Clear separation between routes, controllers, services, and models
- **Type Safety**: Full TypeScript coverage with strict typing
- **Error Handling**: Consistent error handling patterns
- **Validation**: Input validation at all layers
- **Business Logic**: Forex rates, service fees, transaction processing

### Project Structure
```
backend/src/
├── app.ts                 # Express app configuration & middleware setup
├── server.ts             # Server entry point & startup logic
├── config/               # Environment & configuration management
│   ├── database.ts       # MS SQL connection & Sequelize setup
│   ├── redis.ts          # Redis connection
│   ├── kafka.ts          # Kafka producer/consumer setup
│   └── environment.ts    # Environment variables validation
├── middleware/           # Custom Express middleware
│   ├── auth.ts           # JWT authentication middleware
│   ├── rateLimit.ts      # Redis-based rate limiting
│   ├── validation.ts     # Request validation middleware
│   └── cors.ts           # CORS configuration
├── modules/              # Feature modules (auth, users, senders, receivers, transactions)
│   └── [module]/
│       ├── [module].controller.ts    # HTTP request handlers
│       ├── [module].service.ts       # Business logic
│       ├── [module].route.ts         # Route definitions
│       ├── [module].validation.ts    # Input validation schemas
│       ├── [module].types.ts         # TypeScript interfaces
│       └── [module].model.ts         # Sequelize models
├── routes/               # Route aggregation
├── utils/                # Shared utilities & helpers
│   ├── response.ts       # API response utilities
│   ├── asyncHandler.ts   # Async error handling
│   ├── logger.ts         # Winston logging
│   ├── pagination.ts     # Pagination utility
│   ├── forex.ts          # Currency conversion utilities
│   └── fees.ts           # Service fee calculation
├── jobs/                 # Background jobs (Kafka consumers)
└── migrations/           # Database migrations
```

## Module Architecture Pattern

Each backend module follows this consistent structure:

### 1. **Model Layer** (`[module].model.ts`)
```typescript
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database';

export interface IModuleAttributes {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface IModuleInstance extends Model<IModuleAttributes>, IModuleAttributes {}

const ModuleModel = sequelize.define<IModuleInstance>('Module', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: [0, 500],
    },
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'modules',
  timestamps: true,
  indexes: [
    { fields: ['name'], unique: true },
    { fields: ['createdAt'] },
  ],
});

// Associations
ModuleModel.associate = (models: any) => {
  // Define associations here
};

export default ModuleModel;
```

### 2. **Types Layer** (`[module].types.ts`)
```typescript
import { Request } from 'express';

// Core interfaces
export interface IModuleData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateModuleData {
  name: string;
  description?: string;
}

export interface IUpdateModuleData {
  name?: string;
  description?: string;
}

// API Response types
export interface ModuleResponse {
  module: IModuleData;
}

export interface ModuleListResponse {
  modules: IModuleData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Service result types
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Extended Express types
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}
```

### 3. **Validation Layer** (`[module].validation.ts`)
```typescript
import { z } from 'zod';

// Common validation patterns
const uuidSchema = z.string().uuid('Invalid UUID format');

const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
});

// Module-specific schemas
export const createModuleSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .trim()
      .optional()
  })
});

export const updateModuleSchema = z.object({
  params: z.object({
    id: uuidSchema
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .trim()
      .optional()
  })
});

export const getModuleSchema = z.object({
  params: z.object({
    id: uuidSchema
  })
});

export const listModulesSchema = paginationSchema;

export const deleteModuleSchema = z.object({
  params: z.object({
    id: uuidSchema
  })
});

// Type exports for use in services/controllers
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type GetModuleInput = z.infer<typeof getModuleSchema>;
export type ListModulesInput = z.infer<typeof listModulesSchema>;
export type DeleteModuleInput = z.infer<typeof deleteModuleSchema>;
```

### 4. **Service Layer** (`[module].service.ts`)
```typescript
import { Op } from 'sequelize';
import ModuleModel from './module.model';
import logger from '../../utils/logger';
import { ICreateModuleData, IUpdateModuleData, IModuleData, ServiceResult } from './module.types';
import { paginate } from '../../utils/pagination';

export class ModuleService {
  static async create(data: ICreateModuleData, createdBy?: string): Promise<ServiceResult<IModuleData>> {
    try {
      // Check if module with same name exists
      const existingModule = await ModuleModel.findOne({
        where: { name: { [Op.iLike]: data.name } }
      });

      if (existingModule) {
        return {
          success: false,
          error: 'Module with this name already exists',
          statusCode: 409
        };
      }

      const module = await ModuleModel.create({
        ...data,
        createdBy,
        updatedBy: createdBy,
      });

      logger.info(`Module created: ${module.name}`);
      return { success: true, data: this.toPublicData(module) };
    } catch (error) {
      logger.error('Module creation error:', error);
      return {
        success: false,
        error: 'Failed to create module',
        statusCode: 500
      };
    }
  }

  static async getById(id: string): Promise<ServiceResult<IModuleData>> {
    try {
      const module = await ModuleModel.findByPk(id);
      if (!module) {
        return {
          success: false,
          error: 'Module not found',
          statusCode: 404
        };
      }

      return { success: true, data: this.toPublicData(module) };
    } catch (error) {
      logger.error('Module retrieval error:', error);
      return {
        success: false,
        error: 'Failed to retrieve module',
        statusCode: 500
      };
    }
  }

  static async update(id: string, data: IUpdateModuleData, updatedBy?: string): Promise<ServiceResult<IModuleData>> {
    try {
      const module = await ModuleModel.findByPk(id);
      if (!module) {
        return {
          success: false,
          error: 'Module not found',
          statusCode: 404
        };
      }

      // Check name uniqueness if name is being updated
      if (data.name && data.name !== module.name) {
        const existingModule = await ModuleModel.findOne({
          where: { name: { [Op.iLike]: data.name } }
        });
        if (existingModule) {
          return {
            success: false,
            error: 'Module with this name already exists',
            statusCode: 409
          };
        }
      }

      await module.update({
        ...data,
        updatedBy,
      });

      logger.info(`Module updated: ${module.name}`);
      return { success: true, data: this.toPublicData(module) };
    } catch (error) {
      logger.error('Module update error:', error);
      return {
        success: false,
        error: 'Failed to update module',
        statusCode: 500
      };
    }
  }

  static async delete(id: string): Promise<ServiceResult> {
    try {
      const module = await ModuleModel.findByPk(id);
      if (!module) {
        return {
          success: false,
          error: 'Module not found',
          statusCode: 404
        };
      }

      await ModuleModel.destroy({ where: { id } });

      logger.info(`Module deleted: ${module.name}`);
      return { success: true, data: { message: 'Module deleted successfully' } };
    } catch (error) {
      logger.error('Module deletion error:', error);
      return {
        success: false,
        error: 'Failed to delete module',
        statusCode: 500
      };
    }
  }

  static async list(query: any): Promise<ServiceResult<any>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      const whereClause: any = {};

      // Add search functionality
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const order = [[sortBy, sortOrder.toUpperCase()]];

      const result = await paginate(ModuleModel, whereClause, {
        page,
        limit,
        order,
      });

      return {
        success: true,
        data: {
          modules: result.data.map((module: any) => this.toPublicData(module)),
          pagination: result.pagination
        }
      };
    } catch (error) {
      logger.error('Module list error:', error);
      return {
        success: false,
        error: 'Failed to retrieve modules',
        statusCode: 500
      };
    }
  }

  private static toPublicData(module: any): IModuleData {
    return {
      id: module.id,
      name: module.name,
      description: module.description,
      createdAt: module.createdAt.toISOString(),
      updatedAt: module.updatedAt.toISOString(),
      createdBy: module.createdBy,
      updatedBy: module.updatedBy,
    };
  }
}
```

### 5. **Controller Layer** (`[module].controller.ts`)
```typescript
import { Response } from 'express';
import { ModuleService } from './module.service';
import { AuthenticatedRequest, ModuleResponse, ModuleListResponse } from './module.types';
import response from '../../utils/response';
import asyncHandler from '../../utils/asyncHandler';

export class ModuleController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ModuleService.create(req.body, req.userId);
    if (!result.success) return response.error(res, result.error!, result.statusCode);
    return response.created(res, 'Module created successfully', result.data);
  });

  static getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await ModuleService.getById(id);
    if (!result.success) return response.error(res, result.error!, result.statusCode);
    return response.success(res, 'Module retrieved successfully', result.data);
  });

  static update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await ModuleService.update(id, req.body, req.userId);
    if (!result.success) return response.error(res, result.error!, result.statusCode);
    return response.success(res, 'Module updated successfully', result.data);
  });

  static delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await ModuleService.delete(id);
    if (!result.success) return response.error(res, result.error!, result.statusCode);
    return response.success(res, 'Module deleted successfully', result.data);
  });

  static list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ModuleService.list(req.query);
    if (!result.success) return response.error(res, result.error!, result.statusCode);
    return response.success(res, 'Modules retrieved successfully', result.data);
  });
}
```

### 6. **Routes Layer** (`[module].route.ts`)
```typescript
import express from 'express';
import { ModuleController } from './module.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorization';
import validateRequest from '../../middleware/validation';
import {
  createModuleSchema,
  updateModuleSchema,
  getModuleSchema,
  listModulesSchema,
  deleteModuleSchema
} from './module.validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create module (admin only)
router.post('/',
  authorize(['modules.create']),
  validateRequest(createModuleSchema),
  ModuleController.create
);

// Get all modules
router.get('/',
  validateRequest(listModulesSchema),
  ModuleController.list
);

// Get module by ID
router.get('/:id',
  validateRequest(getModuleSchema),
  ModuleController.getById
);

// Update module (admin only)
router.put('/:id',
  authorize(['modules.update']),
  validateRequest(updateModuleSchema),
  ModuleController.update
);

// Delete module (admin only)
router.delete('/:id',
  authorize(['modules.delete']),
  validateRequest(deleteModuleSchema),
  ModuleController.delete
);

export default router;
```

## Business Logic Utilities

### 1. **Forex Utility** (`utils/forex.ts`)
```typescript
// Forex rates (should be configurable via admin panel)
export const EXCHANGE_RATES = {
  JPY_TO_NPR: 0.92,
  // Add other rates as needed
} as const;

export function convertJPYToNPR(amountJPY: number): number {
  return Number((amountJPY * EXCHANGE_RATES.JPY_TO_NPR).toFixed(2));
}

export function convertNPRToJPY(amountNPR: number): number {
  return Number((amountNPR / EXCHANGE_RATES.JPY_TO_NPR).toFixed(2));
}
```

### 2. **Fees Utility** (`utils/fees.ts`)
```typescript
// Service fee tiers in NPR
export const SERVICE_FEE_TIERS = [
  { min: 0, max: 100000, fee: 500 },
  { min: 100000.01, max: 200000, fee: 1000 },
  { min: 200000.01, max: Infinity, fee: 3000 },
] as const;

export function calculateServiceFee(amountNPR: number): number {
  const tier = SERVICE_FEE_TIERS.find(
    (t) => amountNPR >= t.min && amountNPR <= t.max
  );
  return tier?.fee ?? 3000;
}

export function calculateTransferSummary(amountJPY: number) {
  const amountNPR = convertJPYToNPR(amountJPY);
  const serviceFee = calculateServiceFee(amountNPR);
  const serviceFeeJPY = convertNPRToJPY(serviceFee);
  const totalJPY = amountJPY + serviceFeeJPY;

  return {
    amountJPY,
    amountNPR,
    serviceFee,
    serviceFeeJPY,
    totalJPY,
    exchangeRate: EXCHANGE_RATES.JPY_TO_NPR,
  };
}
```

## Database Configuration

### MS SQL Connection (`config/database.ts`)
```typescript
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'swift_transfer',
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('MS SQL Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export { sequelize };
```

## Key Dependencies & Libraries

### Core Framework
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Sequelize**: MS SQL ORM

### Authentication & Security
- **jsonwebtoken**: JWT handling
- **bcryptjs**: Password hashing
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting (Redis-based)

### Message Queue & Cache
- **kafkajs**: Kafka integration
- **redis**: Caching and rate limiting
- **ioredis**: Redis client

### Validation & Utils
- **Zod**: Schema validation
- **Winston**: Logging
- **compression**: Response compression
- **cors**: Cross-origin handling

### Development
- **Nodemon**: Auto-restart
- **ESLint**: Code linting
- **Jest**: Testing framework
- **Sequelize CLI**: Database migrations

## Best Practices

### Database Design
- Use UUID for primary keys
- Consistent naming conventions (PascalCase for tables)
- Proper indexing for performance
- Foreign key constraints
- Soft deletes where appropriate

### Error Handling
- Use ServiceResult pattern for service methods
- Centralized error responses
- Proper HTTP status codes
- Comprehensive logging with Winston

### Security
- Input validation on all endpoints
- Authentication middleware on protected routes
- Rate limiting with Redis
- SQL injection prevention (handled by Sequelize)
- Proper password hashing

### Performance
- Database indexing optimization
- Query optimization with includes/joins
- Redis caching for frequently accessed data
- Pagination for large datasets

## Development Workflow

1. **Create Feature Branch**: `git checkout -b feature/module-name`
2. **Implement Module**: Follow the patterns above
3. **Create Migration**: `npx sequelize-cli migration:generate --name create-module-table`
4. **Run Migrations**: `npx sequelize-cli db:migrate`
5. **Write Tests**: Ensure comprehensive coverage
6. **Code Review**: Submit PR for review
7. **Merge**: After approval, merge to develop
8. **Deploy**: Deploy to staging for testing

This guide provides the foundation for writing consistent, maintainable backend code in the Swift Transfer System. Follow these patterns to ensure code quality and maintainability across all modules.
