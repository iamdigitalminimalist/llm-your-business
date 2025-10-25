import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './dashboard/dashboard.page';
import { NewEvaluation } from './evaluation/new-evaluation.page';
import PartnersListPage from './partners/partners.page';
import { StudioPage } from './studio/studio.page';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evaluation/new" element={<NewEvaluation />} />
        <Route path="/partners" element={<PartnersListPage />} />
        <Route path="/studio" element={<StudioPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
