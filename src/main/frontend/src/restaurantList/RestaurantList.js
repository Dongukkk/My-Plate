import RestaurantCard from './RestaurantCard';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../restaurantList/RestaurantList.css';

import SideBarMenu from '../components/SideBarMenu';

import { useSelector } from 'react-redux';
import { getRestaurants, getMyBookmarks } from '../api/api'; 

function RestaurantList() {
    const navigate = useNavigate();

    const user = useSelector(state => state.user);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sort, setSort] = useState('name');
    const [direction, setDirection] = useState('ASC');

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);
    const recommendTag = ['한식','중식','양식','일식','복지카드사용'];
    const [tagList, setTagList] = useState(recommendTag);
    const loadingRef = useRef(null);

    const fetchRestaurants = async () => {
        if (page === 1) {
            setRestaurants([]);
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const tagsQuery = selectedTags.length > 0 ? selectedTags.join(',') : null;
            const restaurantParams = {
                sort: sort,
                direction: direction,
                page: page,
                limit: 12,
                tag: tagsQuery
            };

            const response = await getRestaurants(restaurantParams);

            let newRestaurants = response.data;

            if (user && user.id) {
                try {
                    const bookmarkResponse = await getMyBookmarks();
                    const bookmarkedRestaurantIds = new Set(bookmarkResponse.data.map(item => item.restaurantId));
                    
                    newRestaurants = newRestaurants.map(restaurant => ({
                        ...restaurant,
                        bookmarked: bookmarkedRestaurantIds.has(restaurant.id)
                    }));
                } catch (bookmarkError) {
                    console.error("북마크 목록을 가져오는 데 실패했습니다:", bookmarkError);
                }
            } else {
                newRestaurants = newRestaurants.map(restaurant => ({
                    ...restaurant,
                    bookmarked: false
                }));
            }

            setRestaurants(prev => {
                return page === 1 ? newRestaurants : [...prev, ...newRestaurants];
            });
            
            if (response.data.length < 12) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    const handleBookmarkToggle = () => {
      setPage(1);
    };

    useEffect(() => {
        fetchRestaurants();
    }, [page, sort, direction, selectedTags, user]);

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
        } else if (newSort === "solo_index_DESC") {
            setSort('solo_index');
            setDirection('DESC');
        } else if (newSort === "solo_index_ASC") {
            setSort('solo_index');
            setDirection('ASC');
        }
        setPage(1);
    };

    const handleTagClick = (tag) => {
        let newSelectedTags = [];
        let newTagList = [...tagList];

        if (selectedTags.includes(tag)) {
            newSelectedTags = selectedTags.filter(t => t !== tag);
            
            if (!recommendTag.includes(tag)) {
                newTagList = newTagList.filter(t => t !== tag);
            }
        } else {
            newSelectedTags = [...selectedTags, tag];

            if (!recommendTag.includes(tag)) {
                newTagList = [...tagList, tag];
            }
        }

        setSelectedTags(newSelectedTags);
        setTagList(newTagList);
        setPage(1);
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
                                    <option value="avg_Rating_DESC">평점 (높은순)</option>
                                    <option value="avg_Rating_ASC">평점 (낮은순)</option>
                                    
                                    <option value="solo_index_ASC">혼밥난이도 (낮은순)</option>
                                    <option value="solo_index_DESC">혼밥난이도 (높은순)</option>
                                </select>
                            </div>
                        </div>
                        <div className='restaurant-list-tag-container'>
                            {tagList && tagList.map((t, idx) => (
                                <span 
                                key={idx} 
                                className={`rc-tag-badge ${selectedTags.includes(t) ? 'active-tag' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTagClick(t);
                                }}
                                >
                                #{t}
                                </span>
                            ))}
                        </div>
                        <div className="restaurant-grid">
                            {restaurants.map(restaurant => (
                                <RestaurantCard 
                                    key={restaurant.id} 
                                    restaurant={restaurant} 
                                    selectedTags={selectedTags} 
                                    onTagClick={handleTagClick} 
                                    initialBookmarkStatus={restaurant.bookmarked}
                                    onBookmarkToggle={handleBookmarkToggle}
                                />
                            ))}
                        </div>
                        
                        <div ref={loadingRef} style={{ textAlign: 'center', marginTop: '20px' }}>
                            {loading && <div>로딩 중...</div>}
                            {!hasMore && !loading &&
                                <div style={{ textAlign: 'center', marginTop:'5%' }}>
                                    <img src={`${process.env.PUBLIC_URL}/images/icon/noresult/SEARCH_NORESULT.png`} style={{width:'60%', margin: '0 auto'}}></img>
                                </div>
                            }
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RestaurantList;