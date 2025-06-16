import { z, type ZodType, type ZodError } from "zod";
/**
 * Base class for all API models
 */
export abstract class BaseModel<TSchema extends ZodType> {
  protected abstract schema: TSchema;
  protected data: z.infer<TSchema>;

  constructor() {
    this.data = {};
  }
  /**
   * Get the validated data
   */
  get value(): z.infer<TSchema> {
    return this.data;
  }

  updateValue(value: Record<string, any>): void {
    Object.assign(this.data, value);
  }

  /**
   * Convert model to plain object
   */
  toJSON(): Record<string, any> {
    return this.data as Record<string, any>;
  }

  /**
   * Validates the model data.
   * @throws {ZodError} If validation fails
   */
  validate(): void {
    const result = this.schema.safeParse(this.data);
    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Safely validates the model data.
   * @returns Validation result with success status and optional error
   */
  safeValidate(): { success: boolean; error?: ZodError } {
    try {
      this.validate();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error as ZodError,
      };
    }
  }

  abstract getModelUuid(): string;

  abstract getModelType(): string;

  abstract getDefaultParams(): Record<string, any>;

  abstract getFeatureCalculator(): string;
}

/**
 * Base class for all API requests
 */
export abstract class BaseRequest<TSchema extends ZodType> extends BaseModel<TSchema> {}
