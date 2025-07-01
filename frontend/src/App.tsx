/**
 * ITCEN Solution Frontend Application
 * 
 * React 19 + MUI v7 + TypeScript를 활용한 메인 애플리케이션 컴포넌트입니다.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './domains/login/pages/LoginPage';
import MainPage from './domains/main/pages/MainPage';
import MeetingStatusPage from './domains/ledgermngt/pages/MeetingStatusPage';
import PositionStatusPage from './domains/ledgermngt/pages/PositionStatusPage';
import ReviewPlanPage from './domains/cmplcheck/pages/ReviewPlanPage';

import ResponsibilityDbStatusPage from './domains/ledgermngt/pages/ResponsibilityDbStatusPage';
import TestGrid from './domains/ledgermngt/pages/TestGrid';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/ledger/company-status" element={<MeetingStatusPage />} />
        <Route path="/ledger/direct-status" element={<PositionStatusPage />} />
        <Route path="/ledger/db-status" element={<ResponsibilityDbStatusPage />} />
        <Route path="/ledger/detail-status" element={<TestGrid />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
