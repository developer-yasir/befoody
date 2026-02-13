import api from '../utils/api';

export const getRiderProfile = async () => {
    try {
        const response = await api.get('/api/riders/profile');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch profile';
    }
};

export const updateAvailability = async (isAvailable) => {
    try {
        const response = await api.put('/api/riders/availability', { isAvailable });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update availability';
    }
};

export const getAvailableOrders = async () => {
    try {
        const response = await api.get('/api/riders/available-orders');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch orders';
    }
};

export const acceptOrder = async (orderId) => {
    try {
        const response = await api.post(`/api/riders/accept-order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to accept order';
    }
};

export const getActiveDelivery = async () => {
    try {
        const response = await api.get('/api/riders/active-delivery');
        return response.data;
    } catch (error) {
        // 404 is expected if no active delivery
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error.response?.data?.message || 'Failed to fetch active delivery';
    }
};

export const completeDelivery = async (orderId) => {
    try {
        const response = await api.post(`/api/riders/complete-delivery/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to complete delivery';
    }
};

export const getEarnings = async () => {
    try {
        const response = await api.get('/api/riders/earnings');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch earnings';
    }
};

export const updateRiderProfile = async (data) => {
    try {
        const response = await api.put('/api/riders/profile', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update profile';
    }
};

export const getDeliveryHistory = async () => {
    try {
        const response = await api.get('/api/riders/history');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch history';
    }
};
