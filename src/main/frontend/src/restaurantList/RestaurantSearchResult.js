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
    const [selectedTag, setSelectedTag] = useState(null);

    const filterRestaurants = (restaurants, searchQuery, tag) => {
        return restaurants.filter(restaurant => {
            const matchesQuery = restaurant.restrntNm?.includes(searchQuery);
            const matchesTag = tag ? restaurant.tags?.some(t => t.tag === tag) : true;
            return matchesQuery && matchesTag;
        });
    };

    const handleTagClick = (tag) => {
        setSelectedTag(prevTag => (prevTag === tag ? null : tag));
    };

    useEffect(() => {
        const fetchAllRestaurants = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3000/api/restaurants/getAllRestaurants?sort=${sort}&direction=${direction}&limit=99999`
                );

                let restaurants = response.data;

                const restaurantsWithTags = await Promise.all(
                    restaurants.map(async (rest) => {
                        try {
                            const tagResp = await axios.get(
                                `http://localhost:3000/api/restaurants/${rest.id}/tags`
                            );
                            return { ...rest, tags: tagResp.data};
                        } catch {
                            return { ...rest, tags: []};
                        }
                    })
                );
                setAllRestaurants(restaurantsWithTags);
                setLoading(false);
            } catch (e) {
                setError(e);
                setLoading(false);
            }
        };

        fetchAllRestaurants();
    }, [sort, direction]);

    useEffect(() => {
        if (!allRestaurants || allRestaurants.length === 0) {
            setFilteredRestaurants([]);
            return;
        }

        const newFilteredRestaurants = filterRestaurants(allRestaurants, query, selectedTag);
        setFilteredRestaurants(newFilteredRestaurants);
    }, [query, allRestaurants, selectedTag]);

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
                                    <RestaurantCard key={restaurant.id} restaurant={restaurant} selectedTag={selectedTag} onTagClick={handleTagClick}/>
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