import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import EvaluationPage from './pages/Evaluation';
import ResultsPage from './pages/Results';
import PartnerDashboard from './pages/PartnerDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/partner" element={<PartnerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;