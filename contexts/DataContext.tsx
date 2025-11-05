import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Client, Deal, Task, User, FunilStage, TaskStatus, FunilStages, TaskType, UserRole, Company } from '../types';
import { mockClients as initialClients, mockDeals as initialDeals, mockTasks as initialTasks, mockUsers, mockCompanies } from '../data/mockData';

interface DataContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, pass: string) => boolean;
  register: (userData: Omit<User, 'id' | 'role' | 'avatarUrl' | 'companyId'>) => boolean;
  logout: () => void;

  // Company
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompanyId: (id: string | null) => void;
  addCompany: (name: string) => Company;
  updateCompany: (id: string, name: string) => void;
  deleteCompany: (id: string) => void;
  
  // Salespeople
  addSalesperson: (data: Omit<User, 'id'|'role'|'avatarUrl'|'companyId'>) => User;
  updateSalesperson: (id: string, data: Partial<Omit<User, 'id' | 'companyId'>>) => void;
  deleteSalesperson: (id: string) => void;

  // Data
  clients: Client[];
  deals: Deal[];
  tasks: Task[];
  users: User[];

  // Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'companyId'>) => Client;
  addDeal: (deal: Omit<Deal, 'id' | 'startDate' | 'companyId' | 'stageDates'>) => Deal;
  addTask: (task: Omit<Task, 'id' | 'status' | 'companyId'>) => Task;
  logActivity: (dealId: string, type: TaskType, description: string, activityDate?: string) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  resetData: () => void;
  exportData: () => void;
  importData: (file: File) => void;
}

const getTodayString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error loading key "${key}" from localStorage`, error);
    }
    return defaultValue;
};

const saveToLocalStorage = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving key "${key}" to localStorage`, error);
    }
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => loadFromLocalStorage('g-sales-crm-clients', []));
  const [deals, setDeals] = useState<Deal[]>(() => loadFromLocalStorage('g-sales-crm-deals', []));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromLocalStorage('g-sales-crm-tasks', []));
  const [users, setUsers] = useState<User[]>(() => loadFromLocalStorage('g-sales-crm-users', mockUsers));
  const [companies, setCompanies] = useState<Company[]>(() => loadFromLocalStorage('g-sales-crm-companies', mockCompanies));

  // Persist data to localStorage
  useEffect(() => { saveToLocalStorage('g-sales-crm-clients', clients); }, [clients]);
  useEffect(() => { saveToLocalStorage('g-sales-crm-deals', deals); }, [deals]);
  useEffect(() => { saveToLocalStorage('g-sales-crm-tasks', tasks); }, [tasks]);
  useEffect(() => { saveToLocalStorage('g-sales-crm-users', users); }, [users]);
  useEffect(() => { saveToLocalStorage('g-sales-crm-companies', companies); }, [companies]);


  // Auth & Company State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!loadFromLocalStorage('g-sales-crm-user', null));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromLocalStorage('g-sales-crm-user', null));
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(() => loadFromLocalStorage('g-sales-crm-company-id', null));


  const userCompanies = currentUser ? companies.filter(c => c.ownerId === currentUser.id || currentUser.companyId === c.id) : [];
  const currentCompany = currentCompanyId ? companies.find(c => c.id === currentCompanyId) || null : userCompanies[0] || null;

  useEffect(() => {
    if (currentUser) {
      saveToLocalStorage('g-sales-crm-user', currentUser);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('g-sales-crm-user');
      localStorage.removeItem('g-sales-crm-company-id');
      setIsAuthenticated(false);
      setCurrentCompanyId(null);
    }
  }, [currentUser]);
  
  useEffect(() => {
      if (currentCompanyId) {
          saveToLocalStorage('g-sales-crm-company-id', currentCompanyId);
      } else {
          localStorage.removeItem('g-sales-crm-company-id');
      }
  }, [currentCompanyId])

  const login = (email: string, pass: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      setCurrentUser(user);
      // If user is a salesperson, their company is fixed.
      if (user.role === UserRole.SALES && user.companyId) {
          setCurrentCompanyId(user.companyId);
      } else { // For Admin/Manager, find the first company they own.
          const userOwnedCompanies = companies.filter(c => c.ownerId === user.id);
          setCurrentCompanyId(userOwnedCompanies[0]?.id || null);
      }
      return true;
    }
    return false;
  };
  
  const register = (userData: Omit<User, 'id' | 'role' | 'avatarUrl' | 'companyId'>): boolean => {
      const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) return false;

      const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
          role: UserRole.ADMIN, // New users are admins of their own account
          avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`
      }
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setCurrentCompanyId(null); // No company on fresh registration
      return true;
  }

  const logout = () => {
    setCurrentUser(null);
  };
  
  const resetData = () => {
    localStorage.removeItem('g-sales-crm-clients');
    localStorage.removeItem('g-sales-crm-deals');
    localStorage.removeItem('g-sales-crm-tasks');
    setClients(initialClients);
    setDeals(initialDeals);
    setTasks(initialTasks);
    // Keep users and companies for auth persistence
  };

    const exportData = () => {
        const dataToExport = {
            clients: loadFromLocalStorage('g-sales-crm-clients', []),
            deals: loadFromLocalStorage('g-sales-crm-deals', []),
            tasks: loadFromLocalStorage('g-sales-crm-tasks', []),
            users: loadFromLocalStorage('g-sales-crm-users', mockUsers),
            companies: loadFromLocalStorage('g-sales-crm-companies', mockCompanies),
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `g-sales-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const importData = (file: File) => {
        if (!window.confirm("Você tem certeza que deseja importar estes dados? Todos os dados atuais serão substituídos. É recomendado fazer um backup (exportar) antes de continuar.")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                // Basic validation
                if (data && typeof data === 'object' && 'clients' in data && 'deals' in data && 'tasks' in data && 'users' in data && 'companies' in data) {
                    saveToLocalStorage('g-sales-crm-clients', data.clients);
                    saveToLocalStorage('g-sales-crm-deals', data.deals);
                    saveToLocalStorage('g-sales-crm-tasks', data.tasks);
                    saveToLocalStorage('g-sales-crm-users', data.users);
                    saveToLocalStorage('g-sales-crm-companies', data.companies);
                    
                    localStorage.removeItem('g-sales-crm-user');
                    localStorage.removeItem('g-sales-crm-company-id');

                    alert("Dados importados com sucesso! A página será recarregada e você precisará fazer login novamente.");
                    window.location.reload();
                } else {
                    alert("Arquivo de backup inválido. A estrutura dos dados está incorreta.");
                }
            } catch (error) {
                console.error("Error parsing backup file:", error);
                alert("Ocorreu um erro ao importar os dados. O arquivo pode estar corrompido ou não ser um JSON válido.");
            }
        };
        reader.readAsText(file);
    };

  // --- Company Management ---
  const addCompany = (name: string): Company => {
    if(!currentUser) throw new Error("User not authenticated");
    const newCompany: Company = { id: `company-${Date.now()}`, name, ownerId: currentUser.id };
    setCompanies(prev => [...prev, newCompany]);
    if (!currentCompanyId) {
        setCurrentCompanyId(newCompany.id);
    }
    return newCompany;
  };

  const updateCompany = (id: string, name: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? {...c, name} : c));
  }

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    if (currentCompanyId === id) {
        const remainingCompanies = companies.filter(c => c.id !== id && c.ownerId === currentUser?.id);
        setCurrentCompanyId(remainingCompanies[0]?.id || null);
    }
  }

  // --- Salesperson Management ---
  const addSalesperson = (data: Omit<User, 'id'|'role'|'avatarUrl'|'companyId'>): User => {
    if (!currentCompany) throw new Error("No company selected");
    const existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) throw new Error("Este e-mail já está em uso.");
    
    const newUser: User = {
        ...data,
        id: `user-${Date.now()}`,
        role: UserRole.SALES,
        avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
        companyId: currentCompany.id
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }
  
  const updateSalesperson = (id: string, data: Partial<Omit<User, 'id' | 'companyId' | 'role'>>) => {
      setUsers(prev => prev.map(u => u.id === id ? {...u, ...data} : u));
  }

  const deleteSalesperson = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
  }


  // --- Data filtered by company and user role ---
  const companyClients = currentCompany ? clients.filter(c => c.companyId === currentCompany.id) : [];
  const companyDeals = currentCompany ? deals.filter(d => d.companyId === currentCompany.id) : [];
  const companyTasks = currentCompany ? tasks.filter(t => t.companyId === currentCompany.id) : [];
  const allUsers = [...users, ...mockUsers.filter(mu => !users.find(u => u.id === mu.id))];
  const companyUsers = currentCompany ? allUsers.filter(u => u.companyId === currentCompany.id || u.id === currentCompany.ownerId) : users;

  const visibleDeals = currentUser?.role === UserRole.SALES ? companyDeals.filter(d => d.salespersonId === currentUser.id) : companyDeals;
  const visibleTasks = currentUser?.role === UserRole.SALES ? companyTasks.filter(t => t.assigneeId === currentUser.id) : companyTasks;


  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'companyId'>): Client => {
    if (!currentCompany) throw new Error("No company selected");
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: getTodayString(),
      companyId: currentCompany.id,
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const addDeal = (dealData: Omit<Deal, 'id' | 'startDate' | 'companyId' | 'stageDates'>): Deal => {
    if (!currentCompany) throw new Error("No company selected");
    const today = getTodayString();
    const newDeal: Deal = {
        ...dealData,
        id: `deal-${Date.now()}`,
        startDate: today,
        companyId: currentCompany.id,
        stageDates: { 'Prospecção': today },
    };
    setDeals(prev => [...prev, newDeal]);
    return newDeal;
  };

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'companyId'>): Task => {
    if (!currentCompany) throw new Error("No company selected");
    const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        status: TaskStatus.PENDING,
        companyId: currentCompany.id
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const logActivity = (dealId: string, type: TaskType, description: string, activityDate?: string) => {
    if (!currentUser || !currentCompany) return;
    
    const activityCompletedAt = activityDate 
        ? new Date(`${activityDate}T12:00:00Z`).toISOString() // Use midday to avoid timezone boundary issues
        : new Date().toISOString();
    
    const activityDueDate = activityDate || getTodayString();

    const newActivity: Task = {
        id: `task-${Date.now()}`,
        title: type,
        description,
        assigneeId: currentUser.id,
        dueDate: activityDueDate, // Keep as 'YYYY-MM-DD'
        status: TaskStatus.COMPLETED,
        type,
        dealId,
        completedAt: activityCompletedAt, // Store as ISO string
        companyId: currentCompany.id,
    };
    setTasks(prev => [newActivity, ...prev]);

    const deal = deals.find(d => d.id === dealId);
    if (deal) {
        const currentStageIndex = FunilStages.indexOf(deal.stage);
        const isNotLastStage = currentStageIndex < FunilStages.length - 1;
        let nextStage: FunilStage | undefined;

        if (isNotLastStage) {
             if (type === TaskType.FOLLOW_UP && deal.stage === 'Prospecção') {
                nextStage = 'Apresentação';
            } else if (type === TaskType.APRESENTACAO && deal.stage === 'Apresentação') {
                nextStage = 'Proposta';
            } else if (type === TaskType.PROPOSTA && deal.stage === 'Proposta') {
                nextStage = 'Negociação';
            } else if (type === TaskType.NEGOCIACAO && deal.stage === 'Negociação') {
                nextStage = 'Fechamento';
            }
        }
       
        if (nextStage) {
            const stageDateForUpdate = activityDate || getTodayString();
            setDeals(prevDeals =>
              prevDeals.map(d =>
                d.id === dealId ? { ...d, stage: nextStage!, stageDates: { ...d.stageDates, [nextStage!]: stageDateForUpdate } } : d
              )
            );
        }
    }
  };
  
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
     setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus, completedAt: newStatus === TaskStatus.COMPLETED ? new Date().toISOString() : undefined } : task
      )
    );
  }

  return (
    <DataContext.Provider value={{ 
        isAuthenticated, currentUser, login, register, logout,
        companies: userCompanies, currentCompany, setCurrentCompanyId, addCompany, updateCompany, deleteCompany,
        addSalesperson, updateSalesperson, deleteSalesperson,
        clients: companyClients, deals: visibleDeals, tasks: visibleTasks, users: companyUsers, 
        addClient, addDeal, addTask, logActivity, updateTaskStatus,
        resetData, exportData, importData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};