import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './hooks/useTheme';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Inicio from './pages/Inicio';
import Funil from './pages/Funil';
import Clientes from './pages/Clientes';
import ClienteDetalhe from './pages/ClienteDetalhe';
import Tarefas from './pages/Tarefas';
import Oportunidades from './pages/Oportunidades';
import OportunidadeDetalhe from './pages/OportunidadeDetalhe';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Vendedores from './pages/Vendedores';

const CrmLayout: React.FC = () => (
  <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/funil" element={<Funil />} />
          <Route path="/oportunidades" element={<Oportunidades />} />
          <Route path="/oportunidades/:id" element={<OportunidadeDetalhe />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetalhe />} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/vendedores" element={<Vendedores />} />
        </Routes>
      </main>
      <footer className="text-center p-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        Desenvolvido por SP Tecnologia & Automação, todos os direitos reservados.
      </footer>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <CrmLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </HashRouter>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;