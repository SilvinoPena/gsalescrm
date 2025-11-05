
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ClientStatus, Client } from '../types';

const AddClientModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addClient } = useData();
    const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt'>>({
        name: '',
        type: 'Pessoa Jurídica',
        documentId: '',
        email: '',
        phone: '',
        address: '',
        leadSource: 'Site',
        status: ClientStatus.PROSPECT,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addClient(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Adicionar Novo Cliente</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" placeholder="Nome / Empresa" onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                    <input type="email" name="email" placeholder="E-mail" onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                    <input type="text" name="phone" placeholder="Telefone" onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" name="documentId" placeholder="CPF ou CNPJ" onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" name="address" placeholder="Endereço" onChange={handleChange} className="md:col-span-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <select name="type" value={formData.type} onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option>Pessoa Jurídica</option>
                        <option>Pessoa Física</option>
                    </select>
                    <select name="leadSource" value={formData.leadSource} onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option>Site</option>
                        <option>Indicação</option>
                        <option>Campanha</option>
                        <option>V4</option>
                        <option>Internet</option>
                        <option>Outro</option>
                    </select>
                     <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option value={ClientStatus.PROSPECT}>Prospect</option>
                        <option value={ClientStatus.ACTIVE}>Ativo</option>
                        <option value={ClientStatus.INACTIVE}>Inativo</option>
                    </select>
                    <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Salvar Cliente</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


const Clientes: React.FC = () => {
    const { clients } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
    const [sourceFilter, setSourceFilter] = useState<'all' | string>('all');

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
            const matchesSource = sourceFilter === 'all' || client.leadSource === sourceFilter;
            return matchesSearch && matchesStatus && matchesSource;
        });
    }, [clients, searchTerm, statusFilter, sourceFilter]);

    const getStatusClass = (status: ClientStatus) => {
        switch (status) {
            case ClientStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case ClientStatus.PROSPECT: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case ClientStatus.INACTIVE: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <>
            {isModalOpen && <AddClientModal onClose={() => setIsModalOpen(false)} />}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold">Lista de Clientes</h2>
                    <div className="flex flex-wrap items-center gap-2">
                         <input type="text" placeholder="Buscar por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                         <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option value="all">Todos Status</option>
                            {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                         <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option value="all">Todas Origens</option>
                            {[...new Set(clients.map(c => c.leadSource))].map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                        <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition">Novo Cliente</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome / Empresa</th>
                                <th scope="col" className="px-6 py-3">E-mail</th>
                                <th scope="col" className="px-6 py-3">Telefone</th>
                                <th scope="col" className="px-6 py-3">Origem</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => (
                                <tr key={client.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {client.name}
                                    </th>
                                    <td className="px-6 py-4">{client.email}</td>
                                    <td className="px-6 py-4">{client.phone}</td>
                                    <td className="px-6 py-4">{client.leadSource}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(client.status)}`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/clientes/${client.id}`} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Ver</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Clientes;