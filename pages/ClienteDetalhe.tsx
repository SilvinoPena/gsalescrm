import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { DealStatus } from '../types';

const ClienteDetalhe: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { clients, deals } = useData();

    const client = clients.find(c => c.id === id);
    const clientDeals = deals.filter(d => d.clientId === id);

    if (!client) {
        return <div className="text-center text-xl">Cliente não encontrado.</div>;
    }
    
    const getStatusClass = (status: DealStatus) => {
        switch (status) {
            case DealStatus.WON: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case DealStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case DealStatus.LOST: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{client.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{client.type} - {client.status}</p>
                    </div>
                </div>
                <div className="border-t dark:border-gray-700 mt-4 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><strong className="block text-gray-500">Responsável:</strong> {client.contactPerson || 'N/A'}</div>
                    <div><strong className="block text-gray-500">Email:</strong> {client.email}</div>
                    <div><strong className="block text-gray-500">Telefone:</strong> {client.phone}</div>
                    <div><strong className="block text-gray-500">CPF/CNPJ:</strong> {client.documentId}</div>
                    <div><strong className="block text-gray-500">Endereço:</strong> {client.address}</div>
                    <div><strong className="block text-gray-500">Cidade:</strong> {client.city || 'N/A'}</div>
                    <div><strong className="block text-gray-500">Origem do Lead:</strong> {client.leadSource}</div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Oportunidades Vinculadas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Nome do Negócio</th>
                                <th className="px-6 py-3">Ramo</th>
                                <th className="px-6 py-3">Etapa do Funil</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Data Fechamento Prev.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientDeals.map(deal => (
                                <tr key={deal.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{deal.name}</td>
                                    <td className="px-6 py-4">{deal.industry}</td>
                                    <td className="px-6 py-4">{deal.stage}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(deal.status)}`}>
                                            {deal.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                </tr>
                            ))}
                             {clientDeals.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">Nenhuma oportunidade encontrada para este cliente.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClienteDetalhe;
