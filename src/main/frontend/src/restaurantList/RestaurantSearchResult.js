import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import SideBarMenu from '../components/SideBarMenu';
import '../restaurantList/RestaurantList.css';

function RestaurantSearchResult() {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('query');

    const [allRestaurants, setAllRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sort, setSort] = useState('name');
    const [direction, setDirection] = useState('ASC');

    // ⭐ API에서 모든 데이터를 한 번에 가져오는 useEffect
    useEffect(() => {
        const fetchAllRestaurants = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3000/api/restaurants/getAllRestaurants?sort=${sort}&direction=${direction}&limit=99999`
                );
                setAllRestaurants(response.data);
                setLoading(false);
            } catch (e) {
                setError(e);
                setLoading(false);
            }
        };

        fetchAllRestaurants();
    }, [sort, direction]);

    // ⭐ 검색어(query) 또는 전체 식당 목록(allRestaurants)이 변경될 때마다 필터링
    useEffect(() => {
        if (!allRestaurants || allRestaurants.length === 0) {
            setFilteredRestaurants([]);
            return;
        }

        const newFilteredRestaurants = allRestaurants.filter(restaurant =>
            restaurant.restrntNm.includes(query)
        );
        setFilteredRestaurants(newFilteredRestaurants);
    }, [query, allRestaurants]);

    // ⭐ 정렬 기준 변경 핸들러
    const handleSortChange = (newSort) => {
        if (newSort === "name_ASC") {
            setSort('name');
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
                            <h2>'{query}'에 대한 검색 결과</h2>
                            <div>
                                <label htmlFor="sort-select">정렬 기준: </label>
                                <select id="sort-select" value={sort+'_'+direction} onChange={(e) => handleSortChange(e.target.value)}>
                                    <option value="name_ASC">이름 순</option>
                                    <option value="avg_Rating_DESC">평점 순 (높은순)</option>
                                    <option value="avg_Rating_ASC">평점 순 (낮은순)</option>
                                </select>
                            </div>
                        </div>
                        <div className="restaurant-grid">
                            {filteredRestaurants.length > 0 ? (
                                filteredRestaurants.map(restaurant => (
                                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                ))
                            ) : (
                                <div>'{query}'에 대한 검색 결과가 없습니다.</div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default RestaurantSearchResult;