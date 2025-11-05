import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { DealStatus, FunilStages, FunilStage } from '../types';

const Oportunidades: React.FC = () => {
    const { deals, clients, users } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all');
    const [stageFilter, setStageFilter] = useState<FunilStage | 'all'>('all');
    const [salespersonFilter, setSalespersonFilter] = useState<string | 'all'>('all');

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            const client = clients.find(c => c.id === deal.clientId);
            const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (client && client.name.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
            const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
            const matchesSalesperson = salespersonFilter === 'all' || deal.salespersonId === salespersonFilter;
            return matchesSearch && matchesStatus && matchesStage && matchesSalesperson;
        });
    }, [deals, clients, searchTerm, statusFilter, stageFilter, salespersonFilter]);

    const getStatusClass = (status: DealStatus) => {
        switch (status) {
            case DealStatus.WON: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case DealStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case DealStatus.LOST: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case DealStatus.FROZEN: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold">Todas as Oportunidades</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input type="text" placeholder="Buscar por negócio ou cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="md:col-span-4 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <select value={stageFilter} onChange={e => setStageFilter(e.target.value as any)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                    <option value="all">Todas Etapas</option>
                    {FunilStages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                    <option value="all">Todos Status</option>
                    {Object.values(DealStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={salespersonFilter} onChange={e => setSalespersonFilter(e.target.value as any)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                    <option value="all">Todos Vendedores</option>
                    {users.filter(u => u.role === 'Vendedor').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome do Negócio</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Vendedor</th>
                            <th scope="col" className="px-6 py-3">Ramo</th>
                            <th scope="col" className="px-6 py-3">Etapa</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDeals.map(deal => {
                            const client = clients.find(c => c.id === deal.clientId);
                            const salesperson = users.find(u => u.id === deal.salespersonId);
                            return (
                            <tr key={deal.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {deal.name}
                                </th>
                                <td className="px-6 py-4">
                                    {client ? <Link to={`/clientes/${client.id}`} className="hover:underline">{client.name}</Link> : 'N/A'}
                                </td>
                                <td className="px-6 py-4">{salesperson?.name || 'N/A'}</td>
                                <td className="px-6 py-4">{deal.industry}</td>
                                <td className="px-6 py-4">{deal.stage}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(deal.status)}`}>
                                        {deal.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                     <Link to={`/oportunidades/${deal.id}`} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Ver Detalhes</Link>
                                </td>
                            </tr>
                        )})}
                         {filteredDeals.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500">Nenhuma oportunidade encontrada com os filtros selecionados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Oportunidades;