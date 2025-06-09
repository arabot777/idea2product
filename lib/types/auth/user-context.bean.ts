import { AuthStatus,AuthStatusType, ActiveStatusType } from "../permission/permission-config.dto";

/**
 * @interface UserContext
 * @description Defines the user context interface, including user ID, roles, permissions, and other information.
 *              Even if not logged in, a default UserContext will be initialized.
 */
export interface UserContext {
  id: string | null; // User ID
  roles: string[];
  authStatus: AuthStatusType; // Authentication status
  activeStatus: ActiveStatusType; // Active status
  subscription?: string[]; // Subscription type
  email?: string;
  teamId?: string;
}
