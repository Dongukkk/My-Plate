import logo from './logo.svg';
import './App.css';
import MainPage from './mainpage/MainPage';
import RestaurantList from './restaurantList/RestaurantList';
import Header from './components/Header';

function App() {
  // return <MainPage/>;
  return (
    <>
      <Header/>
      <RestaurantList/>;
    </>);
}

export default App;
