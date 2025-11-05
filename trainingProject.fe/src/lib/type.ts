export type User = {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  birthday: string;
  userFirstName: string;
  userLastName: string;
  joiningDate: string;
  following: string[];
  followers: string[];
  address?: Address;
};

export type Trip = {
  id: string;
  startCoordinates: Coordinates;
  endCoordinates: Coordinates;
  tripName: string;
  createdBy: string;
  images?: Image[];
  restaurants?: Restaurant[];
  duration?: string | number;
  distance: number;
  difficulty?: number;
  description?: string;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Image = {
  imageFile: string;
  description: string;
  userId?: string;
};

export type Restaurant = {
  id: string;
  restaurantName: string;
  createdBy: string;
  location: Location;
  beerScoreAverage?: number;
  beerScores: number[];
  description?: string;
  images?: Image[];
  websiteURL?: string;
};

export type Location = {
  address?: Address;
  coordinates?: Coordinates;
  geoJsonPoint?: any;
};

export type Address = {
  street: string;
  zipCode: string;
  city: string;
  country: string;
};

export type ImageDto = {
  ImageFile: string;
  Description: string;
  UserId: string;
};

export type LatLng = { lat: number; lng: number };

export type CordsData = {
  startCords: LatLng | null;
  endCords: LatLng | null;
};

export type RestaurantDto = {
  id: string;
  restaurantName: string;
  location: LatLng;
  beerScoreAverage: number;
  description: string;
};

export type ListItem = {
  id: string | number;
  content: string;
};

export type TripItem = {
  tripId: string;
  tripName: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  description: string;
  createdByUsername: string | null;
  createdByProfilePictureUrl: string | null;
};

export type RestaurantItem = {
  id: string;
  restaurantName: string;
  createdBy: string;
};
