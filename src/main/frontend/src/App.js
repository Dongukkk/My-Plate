import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ErrorPage from './admin/ErrorPage';
import AdminMain from './admin/admin-main';
import AdminUser from "./admin/admin-user";
import AdminAnalysis from "./admin/admin-analysis";
import AdminContent from "./admin/admin-content";
import AdminRestaurant from "./admin/admin-restaurant";
import AdminLogin from "./admin/admin-login";
import MainPage from './mainpage/MainPage';
import RestaurantList from './restaurantList/RestaurantList';
import Header from './components/Header';

const MainLayout = () => {

  const location = useLocation();
  const noHeaderFooterRoutes = ['/login', '/signup', '/admin', '/AdminMain', '/AdminUser', '/Adminrestaurants', '/AdminContent', '/Adminanalysis'];
  const showHeaderFooter = !noHeaderFooterRoutes.some(route => location.pathname.startsWith(route));

  return (
    <>
      {showHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/RestaurantList" element={<RestaurantList />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/adminMain" element={<AdminMain />} />
        <Route path="/adminUser" element={<AdminUser />} />
        <Route path="/adminrestaurants" element={<AdminRestaurant />} />
        <Route path="/adminContent" element={<AdminContent />} />
        <Route path="/adminanalysis" element={<AdminAnalysis />} />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

export default App;