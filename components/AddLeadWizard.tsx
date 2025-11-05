import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ClientStatus, DealStatus, FunilStages, TaskType } from '../types';

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Info do Cliente', 'Info da Oportunidade', 'Primeira Tarefa'];
    return (
        <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                index + 1 <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {index + 1}
                        </div>
                        <p className={`mt-2 text-xs text-center ${index + 1 <= currentStep ? 'text-primary-600 font-semibold' : 'text-gray-500'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-auto border-t-2 mx-4 ${index + 1 < currentStep ? 'border-primary-600' : 'border-gray-200 dark:border-gray-600'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

const AddLeadWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { currentUser, addClient, addDeal, addTask } = useData();
    const [step, setStep] = useState(1);

    const [clientData, setClientData] = useState({
        name: '', email: '', phone: '', leadSource: 'Site', city: '', contactPerson: '',
    });
    const [dealData, setDealData] = useState({
        name: '', industry: '', observations: '', firstContactMade: false
    });
    const [taskData, setTaskData] = useState({
        title: 'Reunião de Apresentação', dueDate: '', description: '',
    });
    
    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(s => s + 1);
    };

    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        // 1. Create Client
        const newClient = addClient({
            ...clientData,
            type: 'Pessoa Jurídica', // default
            documentId: '',
            address: '',
            status: ClientStatus.PROSPECT,
        });

        // 2. Create Deal
        const newDeal = addDeal({
            name: dealData.name,
            industry: dealData.industry,
            observations: dealData.observations,
            firstContactMade: dealData.firstContactMade,
            clientId: newClient.id,
            salespersonId: currentUser.id,
            stage: 'Prospecção',
            status: DealStatus.IN_PROGRESS,
            expectedCloseDate: taskData.dueDate,
        });

        // 3. Create First Task
        addTask({
            ...taskData,
            assigneeId: currentUser.id,
            type: TaskType.APRESENTACAO,
            dealId: newDeal.id,
        });

        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-xl font-semibold mb-2">Cadastro de Novo Lead</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Siga os passos para inserir um novo prospect no seu funil de vendas.</p>
                
                <StepIndicator currentStep={step} />

                {step === 1 && (
                    <form onSubmit={handleNext}>
                         <p className="text-sm text-gray-500 mb-4">Insira as informações básicas do seu novo lead. Estes são os dados principais de contato.</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nome / Empresa *" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                            <input type="text" placeholder="Responsável (Contato)" value={clientData.contactPerson} onChange={e => setClientData({...clientData, contactPerson: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            <input type="text" placeholder="Cidade" value={clientData.city} onChange={e => setClientData({...clientData, city: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            <input type="email" placeholder="E-mail *" value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                            <input type="tel" placeholder="Telefone" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            <select value={clientData.leadSource} onChange={e => setClientData({...clientData, leadSource: e.target.value as any})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <option>Site</option>
                                <option>Indicação</option>
                                <option>Campanha</option>
                                <option>V4</option>
                                <option>Internet</option>
                                <option>Outro</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                            <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Próximo</button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleNext}>
                        <p className="text-sm text-gray-500 mb-4">Agora, descreva a oportunidade de negócio. Qual o nome e o ramo de negócio?</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nome do Negócio *" value={dealData.name} onChange={e => setDealData({...dealData, name: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                            <input type="text" placeholder="Ramo do Negócio *" value={dealData.industry} onChange={e => setDealData({...dealData, industry: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                             <textarea placeholder="Observações" value={dealData.observations} onChange={e => setDealData({...dealData, observations: e.target.value})} className="md:col-span-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 h-20"></textarea>
                            <div className="md:col-span-2 flex items-center gap-2">
                                <input type="checkbox" id="firstContactMade" checked={dealData.firstContactMade} onChange={e => setDealData({...dealData, firstContactMade: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600" />
                                <label htmlFor="firstContactMade" className="text-sm text-gray-700 dark:text-gray-300">Primeiro contato já foi realizado?</label>
                            </div>
                        </div>
                        <div className="flex justify-between mt-6">
                            <button type="button" onClick={handleBack} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Voltar</button>
                            <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Próximo</button>
                        </div>
                    </form>
                )}

                 {step === 3 && (
                    <form onSubmit={handleSubmit}>
                        <p className="text-sm text-gray-500 mb-4">Para finalizar, agende a primeira ação para este negócio. Um negócio nunca deve ficar sem um próximo passo definido.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input type="text" placeholder="Título da Tarefa *" value={taskData.title} onChange={e => setTaskData({...taskData, title: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                             <input type="date" value={taskData.dueDate} onChange={e => setTaskData({...taskData, dueDate: e.target.value})} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                             <textarea placeholder="Descrição (opcional)" value={taskData.description} onChange={e => setTaskData({...taskData, description: e.target.value})} className="md:col-span-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 h-20"></textarea>
                        </div>
                        <div className="flex justify-between mt-6">
                            <button type="button" onClick={handleBack} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Voltar</button>
                            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Salvar Lead</button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
};

export default AddLeadWizard;