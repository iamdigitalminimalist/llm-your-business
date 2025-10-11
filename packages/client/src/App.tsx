import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './dashboard/dashboard.page';
import { NewEvaluation } from './evaluation/new-evaluation.page';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evaluation/new" element={<NewEvaluation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
