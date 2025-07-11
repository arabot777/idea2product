export const CacheKeys = {
  COOKIE_MD5: (md5: string) => `cookie:md5:${md5}`,
  USER_METRIC_LIMIT: (userId: string, code: string) => `user:${userId}:metric_limit:${code}`,
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  TEAM_DETAILS: (teamId: string) => `team:${teamId}:details`,
  PRODUCT_LIST: "product:list",
  INVOICE_DETAILS: (invoiceId: string) => `invoice:${invoiceId}:details`,
  ROLE: "role",
  ROLE_PERMISSIONS: "role:permissions",
  PERMISSION_RUNTIME: "permissions:runtime",
  // Add more cache key patterns as needed
};

export const CacheTags = {
  USER: (userId: string) => `user:${userId}`,
  TEAM: (teamId: string) => `team:${teamId}`,
  PRODUCT: "product",
  INVOICE: "invoice",
  ROLE: "role",
  PERMISSION: "permission",
  // Add more cache tags for invalidation
};
