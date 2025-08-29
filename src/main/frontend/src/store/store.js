import { configureStore, createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        searchTerm: ''
    },
    reducers: {
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload; // Immer 덕분에 직접 수정 가능
        },
        clearSearchTerm: (state) => {
            state.searchTerm = '';
        }
    }
});

export const { setSearchTerm, clearSearchTerm } = searchSlice.actions;


export default configureStore({
    reducer: {
        search: searchSlice.reducer
    }
});