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

const userSlice = createSlice({
    name: 'user',
    initialState: {
        id: '',
        email: '',
        name: '',
        role: '',
        provider: ''
    },
    reducers: {
        setUser: (state, action) => {
            const { id, email, name, role, provider } = action.payload;
            state.id = id ?? '';
            state.email = email ?? '';
            state.name = name ?? '';
            state.role = role ?? '';
            state.provider = provider ?? '';
        },
        clearUser: (state) => {
            state.id = '';
            state.email = '';
            state.name = '';
            state.role = '';
            state.provider = '';
        }
    }
})


export const { setUser, clearUser } = userSlice.actions;

export default configureStore({
    reducer: {
        search: searchSlice.reducer,
        user: userSlice.reducer
    }
});