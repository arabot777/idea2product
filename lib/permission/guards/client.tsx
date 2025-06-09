"use client";

import React from "react";
import { useEffect, useState } from "react";
import { permissionRuntimeService } from "../services/runtime";
import { PermissionScope, RejectAction } from "@/lib/types/permission/permission-config.dto";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import type { PermissionCheckResult } from "@/lib/types/permission/permission-config.bean";

// TODO: Not yet implemented


interface WithPermissionProps {
  userContext?: UserContext;
  disabled?: boolean;
}

type PropsWithPermission<P> = Omit<P, keyof WithPermissionProps> & WithPermissionProps;

/**
 * HOC: Wraps a component to add permission checking
 */
export function withPermission<P extends { disabled?: boolean }>(Component: React.ComponentType<P>, permissionKey: string): React.FC<PropsWithPermission<P>> {
  const WrappedComponent: React.FC<PropsWithPermission<P>> = (props) => {
    const [permissionResult, setPermissionResult] = useState<PermissionCheckResult>({
      allowed: false,
      rejectAction: "hide",
    });

    const { userContext, disabled: externalDisabled, ...rest } = props;

    useEffect(() => {
      if (!userContext) {
        setPermissionResult({ allowed: false, rejectAction: "hide" });
        return;
      }

      let mounted = true;

      permissionRuntimeService
        .checkPermission(permissionKey, userContext)
        .then((result) => {
          if (mounted) {
            setPermissionResult(result);
          }
        })
        .catch((error) => {
          console.error("Permission check failed:", error);
          if (mounted) {
            setPermissionResult({ allowed: false, rejectAction: "hide" });
          }
        });

      return () => {
        mounted = false;
      };
    }, [userContext]);

    if (!permissionResult.allowed) {
      switch (permissionResult.rejectAction) {
        case "hide":
          return null;
        case "disable":
          return <Component {...(rest as P)} disabled={true} />;
        default:
          return null;
      }
    }

    return <Component {...(rest as P)} disabled={externalDisabled} />;
  };

  WrappedComponent.displayName = `withPermission(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Permission-aware component
 */
interface DisableableElement {
  disabled?: boolean;
}

interface PermissionAwareProps extends WithPermissionProps {
  permissionKey: string;
  fallback?: React.ReactNode;
  children: React.ReactElement<DisableableElement>;
}

export const PermissionAware = ({ permissionKey, userContext, fallback = null, children }: PermissionAwareProps) => {
  const [permissionResult, setPermissionResult] = useState<PermissionCheckResult>({
    allowed: false,
    rejectAction: "hide",
  });

  useEffect(() => {
    if (!userContext) {
      setPermissionResult({ allowed: false, rejectAction: "hide" });
      return;
    }

    let mounted = true;

    permissionRuntimeService
      .checkPermission(permissionKey, userContext)
      .then((result) => {
        if (mounted) {
          setPermissionResult(result);
        }
      })
      .catch((error) => {
        console.error("Permission check failed:", error);
        if (mounted) {
          setPermissionResult({ allowed: false, rejectAction: "hide" });
        }
      });

    return () => {
      mounted = false;
    };
  }, [userContext, permissionKey]);

  if (!permissionResult.allowed) {
    switch (permissionResult.rejectAction) {
      case "hide":
        return fallback;
      case "disable":
        return React.cloneElement(children, {
          ...children.props,
          disabled: true,
        });
      default:
        return fallback;
    }
  }

  return React.cloneElement(children, children.props);
};

// TODO: To be completed