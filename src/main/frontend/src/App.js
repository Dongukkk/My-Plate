import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ErrorPage from './admin/error-page';
import LoadingPage from "./admin/loading";
import { LoadingProvider, useLoading } from './admin/loading-context';

import AdminMain from './admin/admin-main';
import AdminUser from "./admin/admin-user";
import AdminAnalysis from "./admin/admin-analysis";
import AdminContent from "./admin/admin-content";
import AdminRestaurant from "./admin/admin-restaurant";
import AdminLogin from "./admin/admin-login";
import TermsPage from "./admin/terms-page";

import MainPage from './mainpage/MainPage';
import RestaurantList from './restaurantList/RestaurantList';
import Header from './components/Header';
import Footer from './components/Footer';
import RestaurantDetail from './restaurantList/RestaurantDetail';
import RestaurantSearchResult from './restaurantList/RestaurantSearchResult';
import RestaurantMap from './map/RestaurantMap';

const MainLayout = () => {

  const location = useLocation();
  const noHeaderFooterRoutes = ['/login', '/signup', '/admin', '/AdminMain', '/AdminUser', '/Adminrestaurants', '/AdminContent', '/Adminanalysis'];
  const showHeaderFooter = !noHeaderFooterRoutes.some(route => location.pathname.startsWith(route));

  return (
    <>
      {showHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/search" element={<RestaurantSearchResult />} />
        <Route path="/RestaurantList" element={<RestaurantList />} />
        <Route path="/restaurants/detail/:id" element={<RestaurantDetail />} />
        <Route path="/map" element={<RestaurantMap />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/adminMain" element={<AdminMain />} />
        <Route path="/adminUser" element={<AdminUser />} />
        <Route path="/adminrestaurants" element={<AdminRestaurant />} />
        <Route path="/adminContent" element={<AdminContent />} />
        <Route path="/adminanalysis" element={<AdminAnalysis />} />

        <Route path="/termsOfUse" element={<TermsPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      {showHeaderFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <MainLayout />
      </LoadingProvider>
    </BrowserRouter>
  );
};

const AppContent = () => {
  const { isLoading } = useLoading();
  return (
    <>
      {isLoading && <LoadingPage show={isLoading} />}
      <MainLayout />
    </>
  );
};

export default App;