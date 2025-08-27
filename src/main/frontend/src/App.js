import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorPage from './admin/ErrorPage';
import AdminUser from "./admin/admin-user";
import AdminAnalysis from "./admin/admin-analysis";
import AdminContent from "./admin/admin-content";
import AdminRestaurant from "./admin/admin-restaurant";
import AdminLogin from "./admin/admin-login";
import MainPage from './mainpage/MainPage';
import RestaurantList from './restaurantList/RestaurantList';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Header/>
        <RestaurantList/>;
        <Route path="/admin" element={<AdminLogin />} />
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