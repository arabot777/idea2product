import { db } from "../../drizzle";
import { profiles, Profile } from "../../schemas/auth/profile";
import { eq, and, or } from "drizzle-orm";
import { DrizzlePageUtils, PageParams,PaginationResult } from "@/utils/drizzle.page";

export class ProfileQuery {
  static async getById(id: string): Promise<Profile | undefined> {
    return db.query.profiles.findFirst({
      where: eq(profiles.id, id)
    });
  }

  static async getByEmail(email: string): Promise<Profile | undefined> {
    return db.query.profiles.findFirst({
      where: eq(profiles.email, email)
    });
  }

  static async getAll(): Promise<Profile[]> {
    return db.query.profiles.findMany();
  }

  static async search(query: string): Promise<Profile[]> {
    return db.query.profiles.findMany({
      where: or(
        (profiles.username as any).ilike(`%${query}%`), 
        (profiles.full_name as any).ilike(`%${query}%`), 
        (profiles.email as any).ilike(`%${query}%`)
      )
    });
  }

  /**
   * Paginate user queries.
   * @param params Pagination parameters.
   * @returns Pagination results.
   */
  static async getPagination(params: PageParams): Promise<PaginationResult<Profile>> {
    return DrizzlePageUtils.pagination<Profile>(profiles, params);
  }
}
