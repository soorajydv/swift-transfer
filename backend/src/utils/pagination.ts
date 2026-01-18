
interface PaginationOptions {
  page: number;
  limit: number;
  sort?: any;
  order?: any;
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function paginate<T>(
  model: any,
  whereClause: any,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const { page, limit, sort = [['createdAt', 'DESC']] } = options;

  const offset = (page - 1) * limit;

  // Build query options
  const queryOptions: any = {
    where: whereClause,
    limit,
    offset,
    order: sort,
  };

  // Execute query
  const result = await model.findAndCountAll(queryOptions);

  const totalCount = result.count;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page * limit < totalCount;
  const hasPrevPage = page > 1;

  return {
    data: result.rows as T[],
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
}

// Prisma pagination function
export async function paginatePrisma<T>(
  model: any,
  where: any,
  options: { page: number; limit: number },
  orderBy?: any
): Promise<PaginationResult<T>> {
  const { page, limit } = options;

  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [data, totalCount] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: orderBy || { createdAt: 'desc' },
    }),
    model.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page * limit < totalCount;
  const hasPrevPage = page > 1;

  return {
    data: data as T[],
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
}
