export type UserRole = 'utilisateur' | 'employe' | 'administrateur';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

