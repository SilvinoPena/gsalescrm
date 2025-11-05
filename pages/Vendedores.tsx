import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { User, UserRole } from '../types';

const SalespersonModal: React.FC<{ 
    onClose: () => void; 
    salespersonToEdit: User | null;
}> = ({ onClose, salespersonToEdit }) => {
    const { addSalesperson, updateSalesperson } = useData();
    const [formData, setFormData] = useState({
        name: salespersonToEdit?.name || '',
        email: salespersonToEdit?.email || '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.email) {
            setError("Nome e e-mail são obrigatórios.");
            return;
        }
        if (!salespersonToEdit && !formData.password) {
            setError("A senha é obrigatória para novos vendedores.");
            return;
        }

        try {
            if (salespersonToEdit) {
                const updateData: Partial<User> = { name: formData.name, email: formData.email };
                if (formData.password) updateData.password = formData.password;
                updateSalesperson(salespersonToEdit.id, updateData);
            } else {
                if(!formData.password) { // This check is belt-and-suspenders
                    setError("A senha é obrigatória para novos vendedores.");
                    return;
                }
                addSalesperson({ name: formData.name, email: formData.email, password: formData.password });
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{salespersonToEdit ? 'Editar Vendedor' : 'Adicionar Novo Vendedor'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Nome Completo" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                    <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                    <input type="password" name="password" placeholder={salespersonToEdit ? "Nova Senha (deixe em branco para manter)" : "Senha *"} value={formData.password} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Vendedores: React.FC = () => {
    const { users, deleteSalesperson, currentCompany } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [salespersonToEdit, setSalespersonToEdit] = useState<User | null>(null);

    const salespeople = users.filter(u => u.role === UserRole.SALES && u.companyId === currentCompany?.id);

    const openEditModal = (user: User) => {
        setSalespersonToEdit(user);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setSalespersonToEdit(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este vendedor? Esta ação não pode ser desfeita.")) {
            deleteSalesperson(id);
        }
    }

    if (!currentCompany) {
        return (
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-semibold">Nenhuma empresa selecionada</h2>
                <p className="text-gray-500 mt-2">Por favor, selecione uma empresa no menu superior para gerenciar os vendedores.</p>
            </div>
        )
    }

    return (
        <>
            {isModalOpen && <SalespersonModal onClose={() => setIsModalOpen(false)} salespersonToEdit={salespersonToEdit} />}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold">Vendedores de "{currentCompany?.name}"</h2>
                    <button onClick={openAddModal} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition">Novo Vendedor</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">E-mail</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salespeople.map(user => (
                                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white flex items-center gap-3">
                                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                        {user.name}
                                    </th>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => openEditModal(user)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</button>
                                        <button onClick={() => handleDelete(user.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                            {salespeople.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">Nenhum vendedor cadastrado nesta empresa.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Vendedores;