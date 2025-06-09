"use server";

import { redirect } from "next/navigation";
import { permissionRuntimeService } from "../services/runtime";
import { PermissionScope, RejectAction } from "@/lib/types/permission/permission-config.dto";
import { UserContext } from "@/lib/types/auth/user-context.bean";

/**
 * Middleware function: Check page permission
 */
export async function checkPagePermission(path: string, userContext: UserContext) {
  const key = `${PermissionScope.PAGE}@${path}`;
  const bestMatch = await permissionRuntimeService.findBestMatchingRoute(PermissionScope.PAGE, path, "");
  // console.log("bestMatch", bestMatch, key);
  const result = await permissionRuntimeService.checkPermission(bestMatch || key, userContext);
  return result;
}

/**
 * Middleware function: Check API permission
 */
export async function checkApiPermission(path: string, method: string, userContext: UserContext) {
  const key = `${PermissionScope.API}@${method}@${path}`;
  const bestMatch = await permissionRuntimeService.findBestMatchingRoute(PermissionScope.API, path, method);
  // console.log("bestMatch", bestMatch, key);
  const result = await permissionRuntimeService.checkPermission(bestMatch || key, userContext);
  return result;
}
