import { and, asc, desc, eq, getTableColumns, inArray, like, or, SQL, sql } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "@/lib/db/drizzle";

// Extends PageParams type to support more flexible filtering conditions
export interface PageParams<T = any> {
  page?: number;
  pageSize?: number;
  search?: string;
  searchKey?: string[];
  filter?: Record<string, any>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // Whether to enable fuzzy search, default is true
  enableFuzzySearch?: boolean;
  // Fields to exclude, not participating in filtering
  excludeFields?: string[];
  // Additional fields to select
  extraSelect?: Record<string, any>;
}

// Pagination query result type
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Drizzle ORM Pagination Utility Class
 */
export class DrizzlePageUtils {
  /**
   * Generic pagination query method
   * @param table Drizzle table instance
   * @param params Pagination parameters
   * @returns Pagination query result
   */
  static async pagination<T extends Record<string, any>>(table: PgTable, params: PageParams = {}): Promise<PaginationResult<T>> {
    const { page = 1, pageSize = 10, filter = {}, sortBy = "id", sortOrder = "desc", enableFuzzySearch = true, excludeFields = [], extraSelect = {},search = "", searchKey = [] } = params;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // Get all columns of the table
    const columns = getTableColumns(table);
    const validColumns = new Set(Object.keys(columns));

    // Build filter conditions
    const conditions: SQL[] = [];

    // Process filter conditions
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null || value === "" || excludeFields.includes(key) || !validColumns.has(key)) {
        continue;
      }

      const column = table[key as keyof typeof table] as PgColumn | undefined;
      if (!column) continue;

      // Handle array type values
      if (Array.isArray(value)) {
        if (value.length > 0) {
          conditions.push(inArray(column as any, value));
        }
      }
      // Handle string type values
      else if (typeof value === "string") {
        const columnType = (column as any).__type || "";
        const isUUIDColumn = columnType === "uuid" || key.endsWith("Id") || key.endsWith("_id");
        const isEnumColumn = columnType === "enum" || key === "status" || key.endsWith("Status") || key.endsWith("_status");

        if (isUUIDColumn || isEnumColumn) {
          // For UUID and enum type fields, use exact match
          conditions.push(eq(column as any, value));
        } else {
          conditions.push(eq(column as any, value));
        }
      }
      // For other cases, use exact match
      else {
        conditions.push(eq(column as any, value));
      }
    }

    // Process searchKey
    if (searchKey && searchKey.length > 0 && search) {
      const searchColumns = searchKey
        .filter(key => validColumns.has(key))
        .map(key => table[key as keyof typeof table]);
      
      if (searchColumns.length > 0) {
        const searchConditions = searchColumns.map(column => 
          like(column as any, `%${search}%`)
        );
        // Ensure searchConditions is not an empty array
        if (searchConditions.length > 0) {
          const orCondition = or(...searchConditions);
          if (orCondition) {  // Ensure orCondition is not undefined
            conditions.push(orCondition);
          }
        }
      }
    }

    // Build sort order
    const sortColumn = (validColumns.has(sortBy) ? table[sortBy as keyof typeof table] : undefined) as PgColumn;
    const orderBy = sortOrder.toLowerCase() === "desc" ? desc(sortColumn) : asc(sortColumn);

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : sql`1=1`;

    // Query total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(table)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / pageSize);

    // Query paginated data
    const selectFields = {
      ...columns,
      ...extraSelect,
    };

    const data = await db
      .select(selectFields)
      .from(table)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      data: data as T[],
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Builds an OR condition query
   * @param conditions Array of conditions
   * @returns OR condition
   */
  static or(...conditions: SQL[]): SQL | undefined {
    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return or(...conditions);
  }

  /**
   * Builds an AND condition query
   * @param conditions Array of conditions
   * @returns AND condition
   */
  static and(...conditions: SQL[]): SQL | undefined {
    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return and(...conditions);
  }
}
