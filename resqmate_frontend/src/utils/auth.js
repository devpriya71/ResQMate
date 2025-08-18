export const setAuthToken = (token) => {
    if (!token || token === 'undefined' || token === 'null') {
        localStorage.removeItem('token');
        return;
    }
    localStorage.setItem('token', token);
};

export const getAuthToken = () => {
    const raw = localStorage.getItem('token');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return raw;
};

export const removeAuthToken = () => {
    localStorage.removeItem('token');
};

export const setUserData = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
};

export const getUserData = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
    localStorage.removeItem('user');
};

export const isAuthenticated = () => {
    return !!getAuthToken();
};

export const logout = () => {
    removeAuthToken();
    removeUserData();
};