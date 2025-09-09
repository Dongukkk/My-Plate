import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import SideBarMenu from '../components/SideBarMenu';
import '../restaurantList/RestaurantList.css';
import { useSelector } from 'react-redux';

import { getMyBookmarks } from '../api/api'; 


function RestaurantSearchResult() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const user = useSelector(state => state.user);
    const [ filteredRestaurants, setFilteredRestaurants ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ sort, setSort ] = useState('name');
    const [ direction, setDirection ] = useState('ASC');

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);
    const recommendTag = ['한식','중식','양식','일식','복지카드사용'];
    const [tagList, setTagList] = useState(recommendTag);
    const loadingRef = useRef(null);
    
    const query = new URLSearchParams(location.search).get('query') || '';
    const tagsParam = new URLSearchParams(location.search).get('tag');


    const fetchFilteredRestaurants = async () => {
        if (page === 1) {
            setFilteredRestaurants([]);
        }
        
        setLoading(true);
        setError(null);
        try {
            const initialTags = tagsParam ? tagsParam.split(',') : [];
            setSelectedTags(initialTags);

            const response = await axios.get(
                `http://localhost:3000/api/restaurants/getAllRestaurants?sort=${sort}&direction=${direction}&query=${encodeURIComponent(query)}&tag=${initialTags.join(',')}&limit=99999`
            );

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
            
            setFilteredRestaurants(prev => {
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
        fetchFilteredRestaurants();
    }, [page, query, tagsParam, sort, direction, user]);

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

        const newQueryParam = query ? `query=${encodeURIComponent(query)}` : '';
        const newTagsParam = newSelectedTags.length > 0 ? `tag=${newSelectedTags.join(',')}` : '';
        const separator = newQueryParam && newTagsParam ? '&' : '';

        const newUrl = newQueryParam || newTagsParam
            ? `/search?${newQueryParam}${separator}${newTagsParam}`
            : '/search';

        navigate(newUrl, { replace: true });

        setSelectedTags(newSelectedTags);
        setTagList(newTagList);
        setPage(1);
    };

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

    const getHeaderText = () => {
        const tagsText = selectedTags.length > 0 ? `#${selectedTags.join(', #')}` : '';
        if (query && tagsText) {
            return `'${query}' 및 '${tagsText}'에 대한 검색 결과`;
        } else if (query) {
            return `'${query}'에 대한 검색 결과`;
        } else if (tagsText) {
            return `'${tagsText}'에 대한 검색 결과`;
        } else {
            return '전체 식당 목록';
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
            <SideBarMenu/>
            <div className="rl-container">
                <main className='restaurant-list-main'>
                    <div className="restaurant-list">
                        <div className="list-header">
                            <h2>{getHeaderText()}</h2>
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
                            {filteredRestaurants.length > 0 && (
                                filteredRestaurants.map(restaurant => (
                                    <RestaurantCard 
                                    key={restaurant.id} 
                                    restaurant={restaurant} 
                                    selectedTags={selectedTags} 
                                    onTagClick={handleTagClick} 
                                    initialBookmarkStatus={restaurant.bookmarked}
                                    onBookmarkToggle={handleBookmarkToggle}
                                />
                                ))
                            )}
                        </div>
                        {filteredRestaurants.length == 0 && (
                            <div style={{ textAlign: 'center', marginTop:'5%' }}>
                                <img src={`${process.env.PUBLIC_URL}/images/icon/noresult/SEARCH_NORESULT.png`} style={{width:'60%', margin: '0 auto'}}></img>
                            </div>
                        )}           
                    </div>
                </main>
            </div>
        </div>
    );
}

export default RestaurantSearchResult;