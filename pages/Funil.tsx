import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { FunilStages } from '../types';

const Funil: React.FC = () => {
    const { deals } = useData();
    const [filterDate, setFilterDate] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM format

    const stageCounts = useMemo(() => {
        if (!filterDate) return [];
        const [year, month] = filterDate.split('-').map(Number);
    
        return FunilStages.map(stage => {
            const count = deals.filter(deal => {
                const stageDateStr = deal.stageDates?.[stage];
                if (!stageDateStr) return false;
                
                const [dealYear, dealMonth] = stageDateStr.split('-').map(Number);
                
                return dealYear === year && dealMonth === month;
            }).length;
            return { stage, count };
        });
    }, [deals, filterDate]);

    const funnelData = useMemo(() => {
        const totalProspects = stageCounts[0]?.count || 0;
        let cumulativeCount = 0;
        let previousStageCount = totalProspects;

        return stageCounts.map((item, index) => {
            cumulativeCount += item.count;
            const percOfTotal = totalProspects > 0 ? (item.count / totalProspects) * 100 : 0;
            const percOfPrevious = previousStageCount > 0 ? (item.count / previousStageCount) * 100 : (index === 0 ? 100 : 0);
            const data = {
                ...item,
                percOfTotal,
                percOfPrevious,
            };
            previousStageCount = item.count;
            return data;
        });
    }, [stageCounts]);
    
    const hasDataForMonth = stageCounts.some(s => s.count > 0);
    const totalProspects = funnelData[0]?.count || 0;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7-7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM23 42c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\" fill=\"%239C92AC\" fill-opacity=\"0.08\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')" }}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b dark:border-gray-700 pb-4 gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Funil de Vendas - Oportunidades por Etapa</h3>
                     <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700/80 p-2 rounded-md border border-gray-300 dark:border-slate-600">
                        <label htmlFor="month-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mês:</label>
                        <input 
                            id="month-filter"
                            type="month" 
                            value={filterDate} 
                            onChange={e => setFilterDate(e.target.value)}
                            className="bg-transparent focus:outline-none text-gray-700 dark:text-gray-200 font-medium dark:[color-scheme:dark]"
                        />
                    </div>
                </div>

                <div className="w-full">
                    {funnelData.map((item, index) => {
                         const topWidthPercent = index > 0 && totalProspects > 0 ? (funnelData[index-1].count / totalProspects) * 100 : 100;
                         const bottomWidthPercent = totalProspects > 0 ? (item.count / totalProspects) * 100 : (index === 0 && item.count > 0 ? 100 : 0);

                         const topOffset = (100 - topWidthPercent) / 2;
                         const bottomOffset = (100 - bottomWidthPercent) / 2;
             
                         const clipPath = `polygon(${topOffset}% 0, ${100 - topOffset}% 0, ${100 - bottomOffset}% 100%, ${bottomOffset}% 100%)`;

                        return (
                            <div key={item.stage} className="flex items-center w-full" style={{ height: '70px' }}>
                                <div className="w-1/4 text-right pr-4 text-sm text-gray-600 dark:text-gray-400">
                                    {index === 0 ? (
                                        <p className="font-bold">Total {item.count} Prospecções</p>
                                    ) : (
                                        item.count > 0 &&
                                        <>
                                            <p>Perc. do Anterior = {item.percOfPrevious.toFixed(2)}%</p>
                                            <p>Perc. da Prospecção = {item.percOfTotal.toFixed(2)}%</p>
                                        </>
                                    )}
                                    {index === funnelData.length - 1 && totalProspects > 0 && (
                                        <p className="font-bold mt-1 text-xs">TAXA CONVERSÃO = {item.percOfTotal.toFixed(2)}%</p>
                                    )}
                                </div>
                                <div className="w-3/4 h-full relative">
                                    {item.count > 0 && (
                                        <div 
                                            style={{ clipPath }}
                                            className="absolute top-0 left-0 w-full h-full bg-teal-500"
                                        >
                                            <div className="flex items-center justify-center h-full text-white space-x-4">
                                                <span className="font-bold text-2xl drop-shadow">{item.count}</span>
                                                <span className="font-medium text-sm">{item.stage}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                     {!hasDataForMonth && (
                        <div className="text-center py-10 text-gray-500">
                            Nenhuma atividade no funil para o mês selecionado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Funil;