import { z } from "zod";
import { permissionRuntimeService } from "../services/runtime";
import { PermissionScope } from "@/lib/types/permission/permission-config.dto";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { PermissionError } from "@/lib/types/permission/permission-config.bean";
import { getCachedUser } from "../../auth/session-cache";
import { AppError } from "@/lib/types/app.error";

/**
 * Check Server Action permission
 * @param actionKey - Action permission identifier
 * @param userContext - Optional user context, will be automatically retrieved if not provided
 */
export async function checkActionPermission(actionKey: string, userContext: UserContext): Promise<boolean> {
  const key = `${PermissionScope.ACTION}@${actionKey}`;
  const result = await permissionRuntimeService.checkPermission(key, userContext);

  if (!result.allowed) {
    throw new PermissionError(`No access permission: ${actionKey}`, {
      reason: result.reason,
      actionKey,
      userContext,
    });
  }

  return true;
}

type ActionWithUserFunction<T> = (userContext: UserContext) => Promise<T>;

export function actionWithPermission<T>(permission: string, action: ActionWithUserFunction<T>) {
  return async () => {
    const result = await getCachedUser();
    await checkActionPermission(permission, result.userContext);
    return action(result.userContext);
  };
}

type FormActionWithUserFunction<S extends z.ZodType<any, any>, T> = (data: z.infer<S>, formData: FormData, userContext: UserContext) => Promise<T>;

export function formActionWithPermission<S extends z.ZodType<any, any>, T>(permission: string, schema: S, action: FormActionWithUserFunction<S, T>) {
  return async (formData: FormData | Record<string, any>) => {
    // Ensure formData is an iterable object
    const formDataObj = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData;
    const result = schema.safeParse(formDataObj);
    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", result.error.errors[0].message);
    }
    const userResult = await getCachedUser();
    await checkActionPermission(permission, userResult.userContext);
    return action(result.data, formData instanceof FormData ? formData : new FormData(), userResult.userContext);
  };
}

type DataActionWithUserFunction<S, T> = (data: S, userContext: UserContext) => Promise<T>;

export function dataActionWithPermission<S, T>(permission: string, action: DataActionWithUserFunction<S, T>) {
  return async (data: S) => {
    const result = await getCachedUser();
    await checkActionPermission(permission, result.userContext);
    return action(data, result.userContext);
  };
}
/**
 * Higher-order function for Server Action permission guards
 * Used to wrap Server Actions and perform permission checks
 */
export function withPermission<T, Args extends any[]>(permission: string, actionFn: (...args: Args) => Promise<T>) {
  return async (...args: Args): Promise<T> => {
    try {
      const result = await getCachedUser();
      const userContext = result.userContext;
      await checkActionPermission(permission, userContext);
      return actionFn(...args);
    } catch (error) {
      throw error;
    }
  };
}
