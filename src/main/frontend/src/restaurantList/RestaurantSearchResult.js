import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import SideBarMenu from '../components/SideBarMenu';
import '../restaurantList/RestaurantList.css';


function RestaurantSearchResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('query');
    const tagsParam = new URLSearchParams(location.search).get('tag');

    const [ allRestaurants, setAllRestaurants ] = useState([]);
    const [ filteredRestaurants, setFilteredRestaurants ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ sort, setSort ] = useState('name');
    const [ direction, setDirection ] = useState('ASC');
    const [ selectedTags, setSelectedTags ] = useState([]);

    const filterRestaurants = (restaurants, searchQuery, tagsToFilter) => {
        return restaurants.filter(restaurant => {
            const matchesQuery = searchQuery ? restaurant.restrntNm?.includes(searchQuery) : true;

            const matchesTags = tagsToFilter.length > 0
                ? tagsToFilter.every(tag => restaurant.tags?.some(t => t.tag === tag))
                : true;

            return matchesQuery && matchesTags;
        });
    };

    const handleTagClick = (tag) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [ ...selectedTags, tag ];
        setSelectedTags(newSelectedTags);
        const newTagsParam = newSelectedTags.length > 0
            ? `&tag=${newSelectedTags.map(t => encodeURIComponent(t)).join(',')}`
            : '';

        const newQueryParam = query ? `query=${encodeURIComponent(query)}` : '';

        navigate(`/search?${newQueryParam}${newTagsParam}`);
    };

    useEffect(() => {
        const fetchAllRestaurants = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3000/api/restaurants/getAllRestaurants?sort=${sort}&direction=${direction}&limit=99999`
                );

                const restaurantsWithTags = await Promise.all(
                    response.data.map(async (rest) => {
                        try {
                            const tagResp = await axios.get(
                                `http://localhost:3000/api/restaurants/${rest.id}/tags`
                            );
                            return { ...rest, tags: tagResp.data };
                        } catch {
                            return { ...rest, tags: [] };
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
    }, [ sort, direction ]);

    useEffect(() => {
        const initialTags = tagsParam ? tagsParam.split(',') : [];
        setSelectedTags(initialTags);

        if (!allRestaurants || allRestaurants.length === 0) {
            setFilteredRestaurants([]);
            return;
        }

        const newFilteredRestaurants = filterRestaurants(allRestaurants, query, initialTags);
        setFilteredRestaurants(newFilteredRestaurants);
    }, [ query, allRestaurants, tagsParam ]);

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

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>오류가 발생했습니다: {error.message}</div>;
    }

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

    return (
        <div className="restaurantList-page">
            <SideBarMenu />
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