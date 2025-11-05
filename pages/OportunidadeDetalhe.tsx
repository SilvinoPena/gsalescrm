import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { DealStatus, FunilStages, TaskType, Task, Deal, FunilStage } from '../types';
import AdvanceStageModal from '../components/AdvanceStageModal';

const DealStageManager: React.FC<{ deal: Deal }> = ({ deal }) => {
    const { logActivity } = useData();
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

    const stageActions: Record<FunilStage, { actionText: string, taskType: TaskType, description: string }> = {
        'Prospecção': { actionText: 'Marcar 1º Contato como Feito', taskType: TaskType.FOLLOW_UP, description: 'Primeiro contato realizado e qualificado. Agendando apresentação.' },
        'Apresentação': { actionText: 'Registrar Reunião de Apresentação', taskType: TaskType.APRESENTACAO, description: 'Reunião de apresentação realizada com sucesso.' },
        'Proposta': { actionText: 'Registrar Envio de Proposta', taskType: TaskType.PROPOSTA, description: 'Proposta comercial enviada para o cliente.' },
        'Negociação': { actionText: 'Registrar Reunião de Negociação', taskType: TaskType.NEGOCIACAO, description: 'Reunião de negociação realizada.' },
        'Fechamento': { actionText: 'Registrar Fechamento de Contrato', taskType: TaskType.FECHAMENTO, description: 'Contrato fechado e assinado.' },
    };

    const currentAction = stageActions[deal.stage];
    const currentStageIndex = FunilStages.indexOf(deal.stage);

    const handleAdvanceStageClick = () => {
        setIsAdvanceModalOpen(true);
    };

    const handleSubmitAdvanceStage = (data: { activityDate: string; observations: string }) => {
        if (currentAction) {
            const fullDescription = data.observations
                ? `${currentAction.description}\n\nObservações:\n${data.observations}`
                : currentAction.description;

            logActivity(deal.id, currentAction.taskType, fullDescription, data.activityDate);
        }
        setIsAdvanceModalOpen(false);
    };

    return (
        <>
            {isAdvanceModalOpen && currentAction && (
                <AdvanceStageModal
                    onClose={() => setIsAdvanceModalOpen(false)}
                    onSubmit={handleSubmitAdvanceStage}
                    actionText={currentAction.actionText}
                />
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Etapas da Oportunidade</h3>
                <div className="space-y-4">
                    {FunilStages.map((stage, index) => (
                        <div key={stage} className="flex items-start">
                            <div className="flex flex-col items-center mr-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index < currentStageIndex ? 'bg-green-500 text-white' : index === currentStageIndex ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-500/50' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                    {index < currentStageIndex ? '✓' : index + 1}
                                </div>
                                {index < FunilStages.length - 1 && <div className={`w-0.5 flex-grow mt-2 h-16 ${index < currentStageIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}></div>}
                            </div>
                            <div className={`pt-1 ${index === currentStageIndex ? 'font-bold' : ''} ${index < currentStageIndex ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                                <p>{stage}</p>
                                {index < currentStageIndex && deal.stageDates?.[stage] && (
                                    <p className="text-xs font-normal">
                                        Concluída em: {new Date(deal.stageDates[stage]!).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </p>
                                )}
                                {index === currentStageIndex && deal.status === DealStatus.IN_PROGRESS && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-normal">Próxima Ação: {stageActions[stage]?.actionText}</p>
                                        <button onClick={handleAdvanceStageClick} className="bg-primary-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-primary-700 transition">
                                            Avançar Etapa
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {deal.stage === 'Fechamento' && deal.status === DealStatus.IN_PROGRESS && (
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                            Aguardando fechamento. Altere o status do negócio para "Ganha" ou "Perdida".
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

const ActivityTimeline: React.FC<{ activities: Task[] }> = ({ activities }) => {
     return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Histórico da Negociação</h3>
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3">
                 {activities.length === 0 && <p className="text-gray-500 dark:text-gray-400 p-4">Nenhuma atividade registrada.</p>}
                 {activities.map(activity => (
                     <div key={activity.id} className="mb-8 ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800 dark:bg-blue-900">
                            <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/><path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/></svg>
                        </span>
                        <h4 className="flex items-center mb-1 text-base font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                           Registrado em {activity.completedAt ? new Date(activity.completedAt).toLocaleString('pt-BR') : 'N/A'}
                        </time>
                        <p className="text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{activity.description}</p>
                    </div>
                 ))}
            </div>
        </div>
    )
}

const OportunidadeDetalhe: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { deals, clients, tasks } = useData();

    const deal = deals.find(d => d.id === id);
    const client = deal ? clients.find(c => c.id === deal.clientId) : null;
    const activities = useMemo(() => tasks.filter(t => t.dealId === id).sort((a,b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()), [tasks, id]);

    if (!deal || !client) {
        return <div className="text-center text-xl">Oportunidade não encontrada.</div>;
    }

    const getStatusClass = (status: DealStatus) => {
        switch (status) {
            case DealStatus.WON: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case DealStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <ActivityTimeline activities={activities} />
            </div>
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                     <h2 className="text-xl font-bold">{deal.name}</h2>
                     <p className="text-gray-500 dark:text-gray-400 mb-4">
                        para <Link to={`/clientes/${client.id}`} className="text-primary-600 hover:underline">{client.name}</Link>
                     </p>
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 dark:text-gray-400">Ramo:</span>
                            <span>{deal.industry}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 dark:text-gray-400">Etapa Atual:</span>
                            <span>{deal.stage}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(deal.status)}`}>
                                {deal.status}
                            </span>
                        </div>
                         <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 dark:text-gray-400">Fechamento Previsto:</span>
                            <span>{new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </div>
                        {deal.observations && (
                            <div className="pt-2 border-t dark:border-gray-700">
                                <span className="font-semibold text-gray-600 dark:text-gray-400">Observações:</span>
                                <p className="text-gray-500 dark:text-gray-300 whitespace-pre-wrap">{deal.observations}</p>
                            </div>
                        )}
                     </div>
                </div>
                <DealStageManager deal={deal} />
            </div>
        </div>
    );
};

export default OportunidadeDetalhe;