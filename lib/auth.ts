'use client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'developer' | 'manager';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Mock users for authentication (initial users)
const initialUsers: User[] = [
  {
    id: '1',
    email: 'developer@fealtyx.com',
    name: 'John Developer',
    role: 'developer',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    email: 'manager@fealtyx.com',
    name: 'Sarah Manager',
    role: 'manager',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

// Get all users from localStorage or return initial users
const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return initialUsers;
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  // Save initial users to localStorage
  localStorage.setItem('users', JSON.stringify(initialUsers));
  return initialUsers;
};

// Get stored credentials
const getStoredCredentials = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const storedCredentials = localStorage.getItem('credentials');
  if (storedCredentials) {
    return JSON.parse(storedCredentials);
  }
  // Initialize with default credentials
  const defaultCredentials = {
    'developer@fealtyx.com': 'password',
    'manager@fealtyx.com': 'password'
  };
  localStorage.setItem('credentials', JSON.stringify(defaultCredentials));
  return defaultCredentials;
};

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('users', JSON.stringify(users));
  }
};

// Save credentials to localStorage
const saveCredentials = (credentials: Record<string, string>): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('credentials', JSON.stringify(credentials));
  }
};

export const register = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'developer' | 'manager' = 'developer'
): Promise<{ success: boolean; message: string; user?: User }> => {
  const users = getStoredUsers();
  const credentials = getStoredCredentials();
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'User with this email already exists' };
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address' };
  }
  
  // Validate password strength
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long' };
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    role,
    avatar: `https://images.pexels.com/photos/${role === 'manager' ? '1130626' : '2379004'}/pexels-photo-${role === 'manager' ? '1130626' : '2379004'}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`
  };
  
  // Save user and credentials
  const updatedUsers = [...users, newUser];
  const updatedCredentials = { ...credentials, [email]: password };
  
  saveUsers(updatedUsers);
  saveCredentials(updatedCredentials);
  
  return { success: true, message: 'Registration successful', user: newUser };
};

export const login = async (email: string, password: string): Promise<User | null> => {
  const users = getStoredUsers();
  const credentials = getStoredCredentials();
  
  const user = users.find(u => u.email === email);
  if (user && credentials[email] === password) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = (): void => {
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const getAllUsers = (): User[] => {
  return getStoredUsers();
};

export const updateUserProfile = (userId: string, updates: Partial<User>): User | null => {
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  saveUsers(users);
  
  // Update current user in localStorage if it's the same user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  
  return updatedUser;
};