import RestaurantCard from './RestaurantCard';
import axios from 'axios';
import { useState, useEffect } from 'react';
import '../restaurantList/RestaurantList.css'; // CSS 파일 불러오기

import SideBarMenu from '../components/SideBarMenu';

function RestaurantList() {
    const [ restaurants, setRestaurants ] = useState([]);

    const [ loading, setLoading ] = useState(true);

    const [ error, setError ] = useState(null);

    const [sort, setSort] = useState('name');
    const [direction, setDirection] = useState('ASC');


    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `http://localhost:3000/api/restaurants/getAllRestaurants?sort=${sort}&direction=${direction}`
                );
                setRestaurants(response.data);
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [sort, direction]);

    const handleSortChange = (newSort) => {
        console.log(newSort);
        if (newSort === "name_ASC") {
            setSort('name')
            setDirection('ASC');
        } else if (newSort === "avg_Rating_DESC"){
            setSort('avg_Rating');
            setDirection('DESC');
        } else if (newSort === "avg_Rating_ASC"){
            setSort('avg_Rating');
            setDirection('ASC');
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류가 발생했습니다: {error.message}</div>;
    }

    return (
        <div className="restaurantList-page">
            <SideBarMenu />
            <div className="rl-container">
                <main className='restaurant-list-main'>
                    
                    <div className="restaurant-list">
                        <div className="list-header">
                            <h2>레스토랑 목록</h2>
                            <p>검색 결과: {restaurants.length}개의 레스토랑</p>
                            <label htmlFor="sort-select">정렬 기준: </label>
                            <select id="sort-select" value={sort+'_'+direction} onChange={(e)=>{handleSortChange(e.target.value);}}>
                                <option value="name_ASC">이름 순</option>
                                <option value="avg_Rating_DESC">평점 순 (높은순)</option>
                                <option value="avg_Rating_ASC">평점 순 (낮은순)</option>
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
        </div>
        
    );
};

export default RestaurantList;