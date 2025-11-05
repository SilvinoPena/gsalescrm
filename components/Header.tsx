import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ICONS } from '../constants';
import ThemeToggle from './ThemeToggle';
import { Company, UserRole } from '../types';

const CompanyManagerModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { companies, addCompany, updateCompany, deleteCompany } = useData();
    const [newCompanyName, setNewCompanyName] = useState('');
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    const handleAddCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCompanyName.trim()) {
            addCompany(newCompanyName.trim());
            setNewCompanyName('');
        }
    };
    
    const handleUpdateCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if(editingCompany && editingCompany.name.trim()) {
            updateCompany(editingCompany.id, editingCompany.name.trim());
            setEditingCompany(null);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Gerenciar Empresas</h3>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                    {companies.map(company => (
                        <div key={company.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                           {editingCompany?.id === company.id ? (
                               <form onSubmit={handleUpdateCompany} className="flex-grow flex items-center">
                                   <input 
                                        type="text" 
                                        value={editingCompany.name}
                                        onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                                        className="p-1 border rounded bg-white dark:bg-gray-600 w-full"
                                   />
                                   <button type="submit" className="ml-2 px-2 py-1 text-xs rounded bg-green-500 text-white">Salvar</button>
                                   <button type="button" onClick={() => setEditingCompany(null)} className="ml-1 px-2 py-1 text-xs rounded bg-gray-500 text-white">X</button>
                               </form>
                           ) : (
                               <>
                                <span className="text-sm">{company.name}</span>
                                <div className="space-x-2">
                                    <button onClick={() => setEditingCompany(company)} className="text-xs text-blue-500 hover:underline">Editar</button>
                                    <button onClick={() => deleteCompany(company.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                                </div>
                               </>
                           )}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAddCompany} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newCompanyName} 
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        placeholder="Nome da nova empresa"
                        className="flex-grow p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Adicionar</button>
                </form>
                <div className="text-right mt-4">
                     <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm">Fechar</button>
                </div>
            </div>
        </div>
    )
}


const Header: React.FC = () => {
  const { currentUser, logout, resetData, companies, currentCompany, setCurrentCompanyId, exportData, importData } = useData();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanySelectorOpen, setCompanySelectorOpen] = useState(false);
  const [isCompanyManagerOpen, setCompanyManagerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Início';
    if (path.startsWith('/funil')) return 'Funil de Vendas';
    if (path.startsWith('/oportunidades')) return 'Oportunidades';
    if (path.startsWith('/clientes')) return 'Clientes';
    if (path.startsWith('/tarefas')) return 'Tarefas';
    if (path.startsWith('/vendedores')) return 'Vendedores';
    return 'G-SalesCRM';
  };
  
  if (!currentUser) return null;

  const handleReset = () => {
      if (window.confirm("Você tem certeza que deseja zerar os dados de clientes, oportunidades e tarefas? Esta ação não pode ser desfeita.")) {
          resetData();
          setIsProfileOpen(false); // close dropdown after action
      }
  }

  const handleSelectCompany = (id: string) => {
      setCurrentCompanyId(id);
      setCompanySelectorOpen(false);
  }
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          importData(file);
          if (event.target) event.target.value = '';
      }
  };

  const isManagerOrAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;

  return (
    <>
    {isCompanyManagerOpen && <CompanyManagerModal onClose={() => setCompanyManagerOpen(false)} />}
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">{getPageTitle()}</h1>
        
        {/* Company Selector */}
        <div className="relative">
            {isManagerOrAdmin ? (
                 <>
                    <button onClick={() => setCompanySelectorOpen(!isCompanySelectorOpen)} className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                        {ICONS.building}
                        <span className="font-medium text-sm hidden sm:inline">{currentCompany?.name || 'Selecione a Empresa'}</span>
                        {ICONS.chevronDown}
                    </button>
                     {isCompanySelectorOpen && (
                        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
                            {companies.map(company => (
                                <button key={company.id} onClick={() => handleSelectCompany(company.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                    {company.name}
                                </button>
                            ))}
                            <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                            <button onClick={() => {setCompanyManagerOpen(true); setCompanySelectorOpen(false);}} className="block w-full text-left px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                                Gerenciar Empresas
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                    {ICONS.building}
                    <span className="font-medium text-sm hidden sm:inline">{currentCompany?.name || 'Nenhuma empresa'}</span>
                </div>
            )}
        </div>
      </div>


      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
          {ICONS.bell}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2">
              <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">{currentUser.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</span>
              </div>
              <span className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}>{ICONS.chevronDown}</span>
          </button>
          {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
                   <button
                    onClick={exportData}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <span className="mr-2">{ICONS.upload}</span>
                    Exportar Dados
                  </button>
                  <button
                    onClick={handleImportClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <span className="mr-2">{ICONS.download}</span>
                    Importar Dados
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <button 
                    onClick={handleReset}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <span className="mr-2">{ICONS.refresh}</span>
                    Zerar Dados
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <button 
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <span className="mr-2">{ICONS.logout}</span>
                    Sair
                  </button>
              </div>
          )}
        </div>
      </div>
    </header>
    <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
    />
    </>
  );
};

export default Header;