import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to request headers
api.interceptors.request.use(
  (config) => {
    // Only set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    // Log detailed error information
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error(`[API Error] Status: ${error.response?.status}`);
    console.error(`[API Error] Data:`, error.response?.data);
    console.error(`[API Error] Message:`, error.message);
    
    // Check if response is HTML (error page) instead of JSON
    if (error.response?.data && typeof error.response.data === 'string') {
      if (error.response.data.includes('<!DOCTYPE') || error.response.data.includes('<html')) {
        console.error('[API Error] Server returned HTML instead of JSON. Check backend URL and routes.');
        const newError = new Error(`Server error (${error.response.status}): Backend may be down or route doesn't exist`);
        return Promise.reject(newError);
      }
    }
    
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    
    if (error.response?.status === 404) {
      console.error('[API Error] Route not found. Check if backend server is running.');
    }
    
    return Promise.reject(error);
  }
);

// ============ FOOD OPERATIONS ============

export const likeFood = async (foodId: string) => {
  const response = await api.post(`/foods/${foodId}/like`);
  return response.data;
};

export const unlikeFood = async (foodId: string) => {
  const response = await api.post(`/foods/${foodId}/unlike`);
  return response.data;
};

export const addComment = async (foodId: string, text: string) => {
  const response = await api.post(`/foods/${foodId}/comment`, { text });
  return response.data;
};

export const removeComment = async (foodId: string, commentId: string) => {
  const response = await api.delete(`/foods/${foodId}/comment/${commentId}`);
  return response.data;
};

export const deleteFood = async (foodId: string) => {
  console.log('[deleteFood] Deleting food:', foodId);
  const response = await api.delete(`/foods/${foodId}`);
  console.log('[deleteFood] Food deleted successfully');
  return response.data;
};

// ============ NOTIFICATION OPERATIONS ============

export const getNotifications = async (limit: number = 10, skip: number = 0) => {
  try {
    console.log(`[getNotifications] Fetching notifications: limit=${limit}, skip=${skip}`);
    const response = await api.get('/notifications', {
      params: { limit, skip }
    });
    console.log(`[getNotifications] Received ${response.data.notifications?.length || 0} notifications`);
    return response.data;
  } catch (error: any) {
    console.error('[getNotifications] Error:', error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    console.log('[getUnreadCount] Fetching unread count');
    const response = await api.get('/notifications/unread/count');
    console.log(`[getUnreadCount] Unread count: ${response.data.unreadCount}`);
    return response.data;
  } catch (error: any) {
    console.error('[getUnreadCount] Error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const deleteNotification = async (notificationId: string) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

// ============ BOOKMARK OPERATIONS ============

export const bookmarkFood = async (foodId: string) => {
  const response = await api.post(`/foods/${foodId}/bookmark`);
  return response.data;
};

export const removeBookmark = async (foodId: string) => {
  const response = await api.post(`/foods/${foodId}/bookmark/remove`);
  return response.data;
};

export const getBookmarkedFoods = async () => {
  const response = await api.get('/foods/saved/all');
  return response.data;
};

// ============ REQUEST TRACKING ============

/**
 * Create a new food request
 * @param foodId - ID of the food to request
 * @returns Promise with request data and notification
 */
export const requestFood = async (foodId: string) => {
  try {
    console.log(`[requestFood] Creating request for food: ${foodId}`);
    const response = await api.post(`/foods/${foodId}/request`);
    console.log(`[requestFood] Success:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[requestFood] Error creating request:`, error);
    const message = error.response?.data?.message || error.message || 'Failed to request food';
    throw new Error(message);
  }
};

/**
 * Get requests I've made
 * @returns Promise with list of my requests
 */
export const getMyRequests = async () => {
  const response = await api.get('/requests/my-requests');
  return response.data;
};

/**
 * Get incoming requests on my food posts
 * @returns Promise with list of incoming requests
 */
export const getIncomingRequests = async () => {
  const response = await api.get('/requests/incoming-requests');
  return response.data;
};

/**
 * Get specific request details
 * @param requestId - ID of the request
 * @returns Promise with request details
 */
export const getRequestById = async (requestId: string) => {
  const response = await api.get(`/requests/${requestId}`);
  return response.data;
};

/**
 * Cancel a pending request
 * @param requestId - ID of the request to cancel
 * @returns Promise with cancellation confirmation
 */
export const cancelRequest = async (requestId: string) => {
  try {
    const response = await api.delete(`/requests/${requestId}/cancel`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel request');
  }
};

/**
 * Update request status
 * @param foodId - ID of the food
 * @param requestId - ID of the request
 * @param status - New status (pending, accepted, rejected, completed)
 * @returns Promise with updated request
 */
export const updateRequestStatus = async (foodId: string, requestId: string, status: string) => {
  try {
    const response = await api.put(`/foods/${foodId}/request/${requestId}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update request status');
  }
};

/**
 * Accept a food request (Owner action)
 * @param foodId - ID of the food
 * @returns Promise with acceptance confirmation
 */
export const acceptRequest = async (foodId: string) => {
  try {
    const response = await api.post(`/foods/${foodId}/accept`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to accept request');
  }
};

/**
 * Reject a food request (Owner action)
 * @param foodId - ID of the food
 * @returns Promise with rejection confirmation
 */
export const rejectRequest = async (foodId: string) => {
  try {
    const response = await api.post(`/foods/${foodId}/reject`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reject request');
  }
};

export default api;
