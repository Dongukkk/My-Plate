import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom"; // ✅ 올바르게 BrowserRouter, Routes, Route를 모두 import
import AdminMain from './admin/admin-main';
import ErrorPage from './admin/ErrorPage';
import AdminUser from "./admin/admin-user";
import AdminAnalysis from "./admin/admin-analysis";
import AdminContent from "./admin/admin-content";
import AdminRestaurant from "./admin/admin-restaurant";
import AdminLogin from "./admin/admin-login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/adminMain" element={<AdminMain />} />
        <Route path="/adminUser" element={<AdminUser />} />
        <Route path="/adminrestaurants" element={<AdminRestaurant />} />
        <Route path="/adminContent" element={<AdminContent />} />
        <Route path="/adminanalysis" element={<AdminAnalysis />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;