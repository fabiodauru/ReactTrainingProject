export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/Authenticate/login",
    REGISTER: "/Authenticate/register",
    LOGOUT: "/Authenticate/logout",
  },
  USER: {
    ME: "/User/me",
    UPDATE: "/User/update",
    DELETE: "/User/delete",
  },
  TRIP: {
    CREATE: "/Trip/create",
    BY_ID: (id: string) => `/Trip/${id}`,
    USER_TRIPS: "/Trip/user/short",
  },
};
