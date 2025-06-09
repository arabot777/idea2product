import { z, type ZodType, type ZodError } from 'zod';

/**
 * Base class for all API models
 */
export abstract class BaseModel<TSchema extends ZodType> {
  protected abstract schema: TSchema;
  protected abstract data: z.infer<TSchema>;

  /**
   * Get the validated data
   */
  get value(): z.infer<TSchema> {
    return this.data;
  }

  /**
   * Convert model to plain object
   */
  toJSON(): Record<string, unknown> {
    return this.data as Record<string, unknown>;
  }


  /**
   * Validates the model data.
   * @throws {ZodError} If validation fails
   */
  validate(): void {
    this.schema.safeParse(this.data);
  }

  /**
   * Safely validates the model data.
   * @returns Validation result with success status and optional error
   */
  safeValidate(): { success: boolean; error?: ZodError } {
    try {
      this.validate();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error as ZodError
      };
    }
  }

  abstract getModelUuid(): string;

  abstract getModelType(): string;
}

/**
 * Base class for all API requests
 */
export abstract class BaseRequest<TSchema extends ZodType> extends BaseModel<TSchema> {}