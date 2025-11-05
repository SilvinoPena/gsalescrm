import React, { useState } from 'react';

interface AdvanceStageModalProps {
    onClose: () => void;
    onSubmit: (data: { activityDate: string, observations: string }) => void;
    actionText: string;
}

const getTodayString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AdvanceStageModal: React.FC<AdvanceStageModalProps> = ({ onClose, onSubmit, actionText }) => {
    const [activityDate, setActivityDate] = useState(getTodayString());
    const [observations, setObservations] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activityDate) {
            alert('Por favor, selecione uma data.');
            return;
        }
        onSubmit({ activityDate, observations });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4">Registrar Ação e Avançar Etapa</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Ação a ser registrada: <span className="font-medium">{actionText}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="activityDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data da Ação</label>
                        <input
                            type="date"
                            id="activityDate"
                            value={activityDate}
                            onChange={e => setActivityDate(e.target.value)}
                            className="mt-1 w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:[color-scheme:dark]"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
                        <textarea
                            id="observations"
                            value={observations}
                            onChange={e => setObservations(e.target.value)}
                            placeholder="Descreva detalhes importantes sobre esta ação..."
                            className="mt-1 w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 h-28"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Salvar e Avançar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdvanceStageModal;
