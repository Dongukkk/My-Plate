import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ErrorPage from './admin/error-page';
import { LoadingProvider, useLoading } from './admin/loading-context';

import { useEffect,useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from './store/store';

import AdminMain from './admin/admin-main';
import AdminUser from "./admin/admin-user";
import AdminAnalysis from "./admin/admin-analysis";
import AdminContent from "./admin/admin-content";
import AdminRestaurant from "./admin/admin-restaurant";
import AdminLogin from "./admin/admin-login";
import AdminRequest from "./admin/admin-request";
import TermsPage from "./admin/terms-page";
import SiteIntro from './introduce/site-intro';
import CardIntro from './introduce/card-intro';
import Chating from './introduce/chating-support';
import FAQ from './introduce/faq-page';
import { AlertProvider } from "./ui/alert-center";

import MainPage from './mainpage/MainPage';
import RestaurantList from './restaurantList/RestaurantList';
import Header from './components/Header';
import Footer from './components/Footer';
import RestaurantDetail from './restaurantList/RestaurantDetail';
import RestaurantSearchResult from './restaurantList/RestaurantSearchResult';
import RestaurantMap from './map/RestaurantMap';
import Login from './account/Login';
import Forgot from './account/Forgot';
import ProtectedRoute from './routes/ProtectedRoute';
import MyPage from './account/MyPage';
import Reset from './account/Reset';
import OAuthCallback from './account/OAuthCallback';
import Register from './account/Register';
import BookmarkList from './restaurantList/BookmarkList';
import PasswordChange from './account/PasswordChange';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

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
        <Route path="/bookmarks" element={<BookmarkList />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/adminMain" element={<AdminMain />} />
        <Route path="/adminUser" element={<AdminUser />} />
        <Route path="/adminrestaurants" element={<AdminRestaurant />} />
        <Route path="/adminContent" element={<AdminContent />} />
        <Route path="/adminanalysis" element={<AdminAnalysis />} />
        <Route path="/adminRequest" element={<AdminRequest />} />

        <Route path="/cardIntro" element={<CardIntro />} />
        <Route path="/siteIntro" element={<SiteIntro />} />
        <Route path="/termsOfUse" element={<TermsPage />} />
        <Route path="/chat" element={<Chating />} />
        <Route path="/faq" element={<FAQ />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        <Route path='/reset' element={<Reset />} />
        <Route path="/oauth/:provider/callback" element={<OAuthCallback />} />

        <Route path="*" element={<ErrorPage />} />

        <Route path="/account/password" element={<PasswordChange />} />


      </Routes>
      {showHeaderFooter && <Footer />}
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  useEffect(() => {
    if (user && user.id) return;

    const access = localStorage.getItem('access');
    if (!access) return;

    fetch('/api/me', {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(userData => {
        dispatch(setUser(userData));
      })
      .catch(err => {
        console.error(err);
      });
  }, [dispatch, user]);

  return (
    <>
    <AlertProvider>
      <BrowserRouter>
      <ScrollToTop />
        <LoadingProvider>
          <MainLayout />
        </LoadingProvider>
      </BrowserRouter>
      {/* <ToastContainer toastClassName="custom-toast"/> */}
      </AlertProvider>
    </>
    
  );
};


export default App;
