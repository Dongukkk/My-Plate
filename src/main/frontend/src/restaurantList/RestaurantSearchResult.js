import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import SideBarMenu from '../components/SideBarMenu';
import '../restaurantList/RestaurantList.css';


function RestaurantSearchResult() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [ filteredRestaurants, setFilteredRestaurants ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ sort, setSort ] = useState('name');
    const [ direction, setDirection ] = useState('ASC');
    const [ selectedTags, setSelectedTags ] = useState([]);
    
    // ✅ URL 파라미터에서 직접 태그와 검색어 가져오기
    const query = new URLSearchParams(location.search).get('query') || '';
    const tagsParam = new URLSearchParams(location.search).get('tag');

    // ✅ 하나의 useEffect로 데이터 가져오기 및 상태 업데이트 통합
    useEffect(() => {
        setLoading(true);
        setError(null);

        // URL의 tagsParam을 기반으로 초기 태그 상태 설정
        const initialTags = tagsParam ? tagsParam.split(',') : [];
        setSelectedTags(initialTags);
        
        const fetchFilteredRestaurants = async () => {
            try {
                // ✅ 백엔드 API에 검색어와 태그를 직접 전달
                const response = await axios.get(
                    `http://localhost:3000/api/restaurants/getAllRestaurants?sort=${sort}&direction=${direction}&query=${encodeURIComponent(query)}&tag=${initialTags.join(',')}&limit=99999`
                );
                
                setFilteredRestaurants(response.data);
                setLoading(false);
            } catch (e) {
                setError(e);
                setLoading(false);
            }
        };

        fetchFilteredRestaurants();
    }, [query, tagsParam, sort, direction]);

    const handleTagClick = (tag) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [ ...selectedTags, tag ];
        
        // ✅ URL을 업데이트하여 useEffect가 다시 실행되도록 유도
        const newTagsParam = newSelectedTags.length > 0 ? newSelectedTags.join(',') : '';
        const newQueryParam = query ? `query=${encodeURIComponent(query)}` : '';
        const separator = newQueryParam && newTagsParam ? '&' : '';
        
        navigate(`/search?${newQueryParam}${separator}tag=${newTagsParam}`);
    };

    const handleSortChange = (newSort) => {
        if (newSort === "name_ASC") {
            setSort('name');
            setDirection('ASC');
        } else if (newSort === "avg_Rating_DESC") {
            setSort('avg_Rating');
            setDirection('DESC');
        } else if (newSort === "avg_Rating_ASC") {
            setSort('avg_Rating');
            setDirection('ASC');
        }
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
            <SideBarMenu onTagClick={handleTagClick} selectedTags={selectedTags} />
            <div className="rl-container">
                <main className='restaurant-list-main'>
                    <div className="restaurant-list">
                        <div className="list-header">
                            <h2>{getHeaderText()}</h2>
                            <div>
                                <label htmlFor="sort-select">정렬 기준: </label>
                                <select id="sort-select" value={sort + '_' + direction} onChange={(e) => handleSortChange(e.target.value)}>
                                    <option value="name_ASC">이름 순</option>
                                    <option value="avg_Rating_DESC">평점 순 (높은순)</option>
                                    <option value="avg_Rating_ASC">평점 순 (낮은순)</option>
                                </select>
                            </div>
                        </div>
                        <div className="restaurant-grid">
                            {filteredRestaurants.length > 0 ? (
                                filteredRestaurants.map(restaurant => (
                                    <RestaurantCard key={restaurant.id} restaurant={restaurant} selectedTags={selectedTags} onTagClick={handleTagClick} />
                                ))
                            ) : (
                                <div>검색 결과가 없습니다.</div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default RestaurantSearchResult;