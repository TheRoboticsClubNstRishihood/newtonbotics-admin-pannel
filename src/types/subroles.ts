export interface Subrole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  permissions: string[];
  priority: number;
  isActive: boolean;
  usersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}


