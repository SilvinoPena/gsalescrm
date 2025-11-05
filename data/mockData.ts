import { Client, Deal, Task, User, UserRole, Company } from '../types';

export const mockCompanies: Company[] = [
  { id: 'company-1', name: 'Minha Empresa', ownerId: 'user-4' }
];

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Ana Silva', email: 'ana@sales.com', password: '123', role: UserRole.SALES, avatarUrl: 'https://i.pravatar.cc/150?u=ana@sales.com', companyId: 'company-1' },
  { id: 'user-2', name: 'Bruno Costa', email: 'bruno@sales.com', password: '123', role: UserRole.SALES, avatarUrl: 'https://i.pravatar.cc/150?u=bruno@sales.com', companyId: 'company-1' },
  { id: 'user-3', name: 'Carla Dias', email: 'carla@manager.com', password: '123', role: UserRole.MANAGER, avatarUrl: 'https://i.pravatar.cc/150?u=carla@manager.com', companyId: 'company-1' },
  { id: 'user-4', name: 'Daniel Alves', email: 'daniel@admin.com', password: '123', role: UserRole.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=daniel@admin.com' }, // Admin might not belong to a company
];


export const mockClients: Client[] = [];
export const mockDeals: Deal[] = [];
export const mockTasks: Task[] = [];