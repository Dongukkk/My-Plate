import RestaurantCard from './RestaurantCard';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import '../restaurantList/RestaurantList.css';

import SideBarMenu from '../components/SideBarMenu';

function RestaurantList() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sort, setSort] = useState('name');
    const [direction, setDirection] = useState('ASC');

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedTag, setSelectedTag] = useState(null);
    const loadingRef = useRef(null);

    //식당 목록 불러오기
    useEffect(() => {
        setRestaurants([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
    }, [sort, direction, selectedTag]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            if (!hasMore && page > 1) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `http://localhost:3000/api/restaurants/getAllRestaurants?sort=${sort}&direction=${direction}&page=${page}&limit=12${selectedTag ? `&tag=${selectedTag}` : ''}`
                );

                let newRestaurants = response.data;

                // 각 식당별 태그 API 호출
                const restaurantWithTags = await Promise.all(
                    newRestaurants.map(async (rest) => {
                        try {
                            const tagResp = await axios.get(
                                `http://localhost:3000/api/restaurants/${rest.id}/tags`
                            );
                            return { ...rest, tags: tagResp.data};
                        } catch (e) {
                            return { ...rest, tags: []};
                        }
                    })
                );
                setRestaurants(prev => [...prev, ...restaurantWithTags]);
                
                if (response.data.length < 12) {
                    setHasMore(false);
                }
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [page, sort, direction, selectedTag]);

    useEffect(() => {
        if (!loadingRef.current) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    setPage(prevPage => prevPage + 1);
                }
            },
            { threshold: 1 }
        );

        observer.observe(loadingRef.current);

        return () => {
            if (loadingRef.current) {
                observer.unobserve(loadingRef.current);
            }
        };
    }, [loading, hasMore]);

    const handleSortChange = (newSort) => {
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

    const handleTagClick = (tag) => {
        setSelectedTag(prevTag => (prevTag === tag ? null : tag));
    };

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
                            <div>
                                <label htmlFor="sort-select">정렬 기준: </label>
                                <select id="sort-select" value={sort+'_'+direction} onChange={(e)=>{handleSortChange(e.target.value);}}>
                                    <option value="name_ASC">이름 순</option>
                                    <option value="avg_Rating_DESC">평점 순 (높은순)</option>
                                    <option value="avg_Rating_ASC">평점 순 (낮은순)</option>
                                </select>
                            </div>
                            
                        </div>
                        <div className="restaurant-grid">
                            {restaurants.map(restaurant => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} selectedTag={selectedTag} onTagClick={handleTagClick}/>
                            ))}
                        </div>
                        
                        <div ref={loadingRef} style={{ textAlign: 'center', marginTop: '20px' }}>
                            {loading && <div>로딩 중...</div>}
                            {!hasMore && !loading && <div>더 이상 레스토랑이 없습니다.</div>}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RestaurantList;