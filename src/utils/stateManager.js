// Simple State Manager for global app state
class StateManager {
  constructor() {
    this.state = {};
    this.listeners = {};
  }
  
  setState(key, value) {
    this.state[key] = value;
    this.notifyListeners(key, value);
  }
  
  getState(key) {
    return this.state[key];
  }
  
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }
  
  notifyListeners(key, value) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(value));
    }
  }
}

// Global state instance
export const appState = new StateManager();

// Initialize user state from localStorage if available
const storedUser = localStorage.getItem('user_data');
if (storedUser) {
  try {
    appState.setState('user', JSON.parse(storedUser));
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem('user_data');
  }
}
