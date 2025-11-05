import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import { FunilStages, TaskStatus } from '../types';
import AddLeadWizard from '../components/AddLeadWizard';

const FirstCompanyModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { addCompany } = useData();
    const [companyName, setCompanyName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (companyName.trim()) {
            addCompany(companyName.trim());
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-2">Bem-vindo(a) ao G-SalesCRM!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Para começar, crie sua primeira empresa. Todo o seu trabalho ficará organizado dentro dela.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                     <input 
                        type="text" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Acme Inc."
                        className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-center text-lg"
                        required
                    />
                    <button type="submit" className="w-full px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">
                        Criar Empresa e Começar
                    </button>
                </form>
            </div>
        </div>
    )
}


const MiniFunil: React.FC = () => {
    const { deals } = useData();
    const stageCounts = FunilStages.map(stage => deals.filter(deal => deal.stage === stage).length);
    const maxCount = Math.max(...stageCounts, 1);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4">Seu Funil de Vendas</h3>
            <div className="space-y-3">
                {FunilStages.map((stage, index) => (
                    <div key={stage}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{stage}</span>
                            <span className="text-gray-500 dark:text-gray-400">{stageCounts[index]} negócios</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${(stageCounts[index] / maxCount) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
             <Link to="/funil" className="text-primary-600 hover:underline text-sm mt-4 inline-block">Ver funil completo →</Link>
        </div>
    );
}

const TarefasPendentes: React.FC = () => {
    const { tasks } = useData();
    const pendingTasks = tasks
        .filter(t => t.status === TaskStatus.PENDING || (new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETED))
        .slice(0, 5);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4">Suas Próximas Tarefas</h3>
            {pendingTasks.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pendingTasks.map(task => (
                        <li key={task.id} className="py-3">
                            <p className="font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa pendente. Bom trabalho!</p>
            )}
             <Link to="/tarefas" className="text-primary-600 hover:underline text-sm mt-4 inline-block">Ver todas as tarefas →</Link>
        </div>
    )
}


const Inicio: React.FC = () => {
  const { currentUser, companies, currentCompany } = useData();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showFirstCompanyModal, setShowFirstCompanyModal] = useState(false);

  useEffect(() => {
      // Small delay to allow context to fully load
      const timer = setTimeout(() => {
          if(companies.length === 0) {
              setShowFirstCompanyModal(true);
          }
      }, 100);
      return () => clearTimeout(timer);
  }, [companies]);

  const hasData = currentCompany;

  return (
    <>
      {showFirstCompanyModal && <FirstCompanyModal onClose={() => setShowFirstCompanyModal(false)}/>}
      {isWizardOpen && <AddLeadWizard onClose={() => setIsWizardOpen(false)} />}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-2xl font-bold">Olá, {currentUser?.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 dark:text-gray-400">Bem-vindo(a) de volta. Aqui está um resumo da sua atividade.</p>
            </div>
            {hasData && (
                <button 
                    onClick={() => setIsWizardOpen(true)}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-primary-700 transition w-full sm:w-auto"
                >
                    Cadastrar Novo Lead
                </button>
            )}
        </div>
        
       {hasData ? (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MiniFunil />
            <TarefasPendentes />
        </div>
       ) : (
         !showFirstCompanyModal && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Nenhuma empresa selecionada</h2>
                <p className="text-gray-500 mt-2">Por favor, crie ou selecione uma empresa para começar a trabalhar.</p>
            </div>
         )
       )}
      </div>
    </>
  );
};

export default Inicio;
