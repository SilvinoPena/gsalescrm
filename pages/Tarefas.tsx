import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Task, TaskStatus, TaskType, User, Deal } from '../types';

const AddTaskModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { users, deals, addTask } = useData();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigneeId: users[0]?.id || '',
        dueDate: '',
        type: TaskType.CALL,
        dealId: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.assigneeId || !formData.dueDate) {
            alert("Preencha os campos obrigatórios: Título, Responsável e Prazo.");
            return;
        }
        addTask(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Criar Nova Tarefa</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="title" placeholder="Título da Tarefa" value={formData.title} onChange={handleChange} className="md:col-span-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                    <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                    <select name="type" value={formData.type} onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        {Object.entries(TaskType).map(([key, value]) => <option key={key} value={value}>{value}</option>)}
                    </select>
                    <select name="dealId" value={formData.dealId} onChange={handleChange} className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option value="">Nenhum negócio vinculado</option>
                        {deals.filter(d => d.status === 'Em andamento').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <textarea name="description" placeholder="Descrição (opcional)" value={formData.description} onChange={handleChange} className="md:col-span-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 h-24"></textarea>
                    <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Salvar Tarefa</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Tarefas: React.FC = () => {
  const { tasks, users, deals, updateTaskStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');

  const filteredTasks = useMemo(() => {
      return tasks
        .map(task => {
            const isLate = new Date(task.dueDate) < new Date() && task.status === TaskStatus.PENDING;
            return { ...task, computedStatus: isLate ? TaskStatus.LATE : task.status };
        })
        .filter(task => {
            const matchesStatus = statusFilter === 'all' || task.computedStatus === statusFilter;
            const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
            return matchesStatus && matchesAssignee;
        })
        .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, statusFilter, assigneeFilter]);
  
  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case TaskStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case TaskStatus.LATE: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
    {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} />}
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold">Lista de Tarefas</h2>
        <div className="flex flex-wrap items-center gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                <option value="all">Todos Status</option>
                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                <option value="all">Todos Responsáveis</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition">Nova Tarefa</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Título</th>
              <th scope="col" className="px-6 py-3">Responsável</th>
              <th scope="col" className="px-6 py-3">Negócio Vinculado</th>
              <th scope="col" className="px-6 py-3">Prazo</th>
              <th scope="col" className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => {
              const assignee = users.find(u => u.id === task.assigneeId);
              const deal = deals.find(d => d.id === task.dealId);

              return (
                <tr key={task.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(task.computedStatus)}`}>
                      {task.computedStatus}
                    </span>
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {task.title}
                    <p className="font-normal text-gray-500 text-xs">{task.type}</p>
                  </th>
                  <td className="px-6 py-4 flex items-center">
                    {assignee && <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full mr-2" />}
                    {assignee?.name}
                  </td>
                  <td className="px-6 py-4">{deal?.name || '-'}</td>
                  <td className="px-6 py-4">{new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td className="px-6 py-4">
                    {task.status === TaskStatus.PENDING && (
                      <button onClick={() => updateTaskStatus(task.id, TaskStatus.COMPLETED)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Concluir</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default Tarefas;
