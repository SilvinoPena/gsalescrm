export enum UserRole {
  ADMIN = 'Administrador',
  MANAGER = 'Gestor',
  SALES = 'Vendedor',
}

export interface Company {
  id: string;
  name: string;
  ownerId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl: string;
  companyId?: string;
}

export enum ClientStatus {
  PROSPECT = 'Prospect',
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
}

export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  type: 'Pessoa Física' | 'Pessoa Jurídica';
  documentId: string; // CPF or CNPJ
  email: string;
  phone: string;
  address: string;
  city?: string;
  leadSource: 'Campanha' | 'Indicação' | 'Site' | 'V4' | 'Internet' | 'Outro';
  status: ClientStatus;
  createdAt: string;
  companyId: string;
}

export enum DealStatus {
  IN_PROGRESS = 'Em andamento',
  WON = 'Ganha',
  LOST = 'Perdida',
  FROZEN = 'Congelada',
}

export const FunilStages = [
  'Prospecção',
  'Apresentação',
  'Proposta',
  'Negociação',
  'Fechamento',
] as const;

export type FunilStage = typeof FunilStages[number];

export interface Deal {
  id: string;
  name: string;
  clientId: string;
  salespersonId: string;
  industry: string;
  startDate: string;
  expectedCloseDate: string;
  stage: FunilStage;
  status: DealStatus;
  observations?: string;
  firstContactMade?: boolean;
  companyId: string;
  stageDates: { [key in FunilStage]?: string };
}

export enum TaskStatus {
  PENDING = 'Pendente',
  COMPLETED = 'Concluída',
  LATE = 'Atrasada',
}

export enum TaskType {
  CALL = 'Ligação',
  VISIT = 'Visita',
  EMAIL = 'E-mail',
  REVIEW = 'Revisão',
  FOLLOW_UP = 'Follow-up',
  APRESENTACAO = 'Reunião de Apresentação',
  PROPOSTA = 'Envio de Proposta',
  NEGOCIACAO = 'Reunião de Negociação',
  FECHAMENTO = 'Fechamento de Contrato',
  OUTRO = 'Outro',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  status: TaskStatus;
  type: TaskType;
  dealId?: string;
  completedAt?: string;
  companyId: string;
}

export interface Document {
  id: string;
  name: string;
  version: number;
  url: string;
  type: 'PDF' | 'DOCX' | 'PNG';
  clientId?: string;
  dealId?: string;
  uploadedAt: string;
  authorId: string;
}