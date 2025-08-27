import RestaurantCard from './RestaurantCard';
import axios from 'axios';
import { useState, useEffect } from 'react';
import '../restaurantList/RestaurantList.css'; // CSS 파일 불러오기

import SideBarMenu from '../components/SideBarMenu';

function RestaurantList() {
    const [ restaurants, setRestaurants ] = useState([]);

    const [ loading, setLoading ] = useState(true);

    const [ error, setError ] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {

                const response = await axios.get('http://localhost:8080/api/restaurants/getAllRestaurants');

                setRestaurants(response.data);
            } catch (e) {

                setError(e);
            } finally {

                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류가 발생했습니다: {error.message}</div>;
    }

    return (
        <div className="app-container">
            <main className='main'>
                <SideBarMenu />
                <div className="restaurant-list">
                    <div className="list-header">
                        <h2>레스토랑 목록</h2>
                        <p>검색 결과: {restaurants.length}개의 레스토랑</p>
                        <select>
                            <option>평점 순 (높은순)</option>
                        </select>
                    </div>
                    <div className="restaurant-grid">
                        {restaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RestaurantList;