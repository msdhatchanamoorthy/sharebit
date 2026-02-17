// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  bio?: string;
  rating: number;
  foodsShared: number;
  foodsCollected: number;
  profilePhoto?: string;
  profilePic?: string;
  latitude?: number;
  longitude?: number;
  role: 'user' | 'admin';
  userType?: 'donor' | 'receiver';
  createdAt?: string;
}

// Food Types
export interface Food {
  _id: string;
  title: string;
  description: string;
  quantity: string;
  image?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  ownerId: User;
  status: 'available' | 'requested' | 'collected';
  requestedBy?: User;
  distanceKm?: number;
  createdAt: string;
  expiryTime?: string;
  category?: 'Veg' | 'Non-Veg' | 'Snacks' | 'Meals' | 'Desserts';
  price?: number;
  bookmarkedBy?: string[];
  likes?: Array<{
    userId: string;
    createdAt: string;
  }>;
  comments?: Array<{
    _id: string;
    userId: User;
    text: string;
    createdAt: string;
  }>;
  likeCount?: number;
  commentCount?: number;
}

// Food Request Types
export interface FoodRequest {
  _id: string;
  foodId: Food;
  requesterId: User;
  ownerId: User;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  recipientId: string;
  senderId: User;
  foodId: Food;
  type: 'like' | 'comment' | 'request';
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// Geolocation
export interface Geolocation {
  latitude: number;
  longitude: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
