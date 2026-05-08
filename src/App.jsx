import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AgentList from './pages/AgentList';
import AgentDetail from './pages/AgentDetail';
import Chat from './pages/Chat';
import TaskList from './pages/TaskList';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<AgentList />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
