// Centralized API configurations for RailSetu
// This separates API endpoints and enables seamless integration with live servers.

export const API_CONFIG = {
  // Base path of our Express backend server
  BACKEND_BASE_URL: '', // Relative path handles proxy correctly on port 3000

  // Endpoints on our local Express server
  endpoints: {
    pnrStatus: '/api/pnr',
    liveTrainStatus: '/api/live',
    trainSearch: '/api/search',
    trainSchedule: '/api/schedule',
    seatAvailability: '/api/seats',
    fareEnquiry: '/api/fare',
  },

  // Real third-party API configurations (used by server-side code)
  RAPID_API_BASE_URL: 'https://irctc1.p.rapidapi.com',
  RAPID_API_HOST: 'irctc1.p.rapidapi.com',
};
