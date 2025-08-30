import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, clearSearchTerm } from '../store/store'

import './RestaurantSearchBar.css';

const tags = [
    '한식', '중식', '양식', '일식', '복지카드', '아시안', '카페'
];

const RestaurantSearchBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const searchTerm = useSelector((state) => state.search.searchTerm);

    const [ allRestaurants, setAllRestaurants ] = useState([]);
    const [ isDropdownVisible, setIsDropdownVisible ] = useState(false);
    const searchBarRef = useRef(null);

    useEffect(() => {
        const fetchAllRestaurants = async () => {
            try {
                const response = await fetch('/api/restaurants/getAllRestaurants?limit=99999');
                const data = await response.json();
                setAllRestaurants(data);
            } catch (error) {
                console.error("데이터를 불러오지 못했습니다:", error);
            }
        };
        fetchAllRestaurants();
    }, []);

    useEffect(() => {
        dispatch(clearSearchTerm());
        setIsDropdownVisible(false);
    }, [ location.pathname, dispatch ]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (event) => {
        dispatch(setSearchTerm(event.target.value));
        setIsDropdownVisible(true);
    };

    const handleSuggestionClick = (suggestion, id) => {
        const trimmedSearchTerm = searchTerm.trim();

        if (trimmedSearchTerm.length === 0) {
            return;
        }
        console.log(`'${suggestion}'으로 검색합니다.`);

        dispatch(setSearchTerm(''));
        setIsDropdownVisible(false);

        if (id) {
            navigate(`/restaurants/detail/${id}`);
        } else {
            navigate(`/search?query=${encodeURIComponent(suggestion)}`);
        }
    };

    const handleFinalSearch = () => {
        const trimmedSearchTerm = searchTerm.trim();

        if (trimmedSearchTerm.length === 0) {
            return;
        }
        const tagMatch = tags.find(tag => tag === searchTerm);
        const restaurantMatch = allRestaurants.find(restaurant => restaurant.restrntNm === searchTerm);

        if (tagMatch) {
            navigate(`/search?tag=${encodeURIComponent(tagMatch)}`);
        } else if (restaurantMatch) {
            navigate(`/restaurants/detail/${restaurantMatch.id}`);
        } else {
            navigate(`/search?query=${searchTerm}`);
        }

        dispatch(setSearchTerm(''));
        setIsDropdownVisible(false);
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleFinalSearch();
        }
    };

    const filteredTags = tags.filter(tag => tag.includes(searchTerm));
    const filteredRestaurants = allRestaurants && allRestaurants.filter(restaurant => restaurant.restrntNm && restaurant.restrntNm.includes(searchTerm));
    const shouldShowDropdown = isDropdownVisible && searchTerm.length > 0 && (filteredTags.length > 0 || (filteredRestaurants && filteredRestaurants.length > 0));

    return (
        <div className="mh-search-container" ref={searchBarRef}>
            <div className="mh-search-box">
                <input
                    type="text"
                    placeholder="태그 또는 식당 이름을 검색하세요"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsDropdownVisible(true)}
                    className="mh-search-input"
                />
                <button onClick={() => handleFinalSearch(searchTerm)}>검색</button>
            </div>
            {shouldShowDropdown && (
                <div className="mh-suggestions-list">
                    <div
                        className="mh-suggestion-item user-input"
                        onClick={() => handleSuggestionClick(searchTerm)}
                    >
                        {searchTerm}
                    </div>
                    {filteredTags.map((tag, index) => (
                        <div
                            key={`tag-${index}`}
                            className="mh-suggestion-item"
                            onClick={() => handleSuggestionClick(tag)}
                        >
                            # {tag}
                        </div>
                    ))}
                    {filteredRestaurants.map((restaurant) => (
                        <div
                            key={restaurant.id}
                            className="mh-suggestion-item"
                            onClick={() => handleSuggestionClick(restaurant.restrntNm, restaurant.id)}
                        >
                            {restaurant.restrntNm}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantSearchBar;