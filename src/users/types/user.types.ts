export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const TYPES = {
  PERSONAL: 'Personal',
  BUSINESS: 'Business',
} as const;

export type Roles = (typeof ROLES)[keyof typeof ROLES];
export type Types = (typeof TYPES)[keyof typeof TYPES];
