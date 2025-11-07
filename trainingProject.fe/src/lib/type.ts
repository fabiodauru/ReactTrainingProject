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

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LatLng = { lat: number; lng: number };

export type Image = {
  imageFile: string;
  description: string;
};

export type ImageWithFile = Image & {
  image: File;
};

export type Address = {
  street: string;
  zipCode: string;
  city: string;
  country: string;
};

export type Location = {
  address?: Address;
  coordinates?: Coordinates;
  geoJsonPoint?: any;
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
  elevation?: number;
};

export type Restaurant = {
  id: string;
  restaurantName: string;
  createdBy: string;
  location: Location;
  beerScoreAverage?: number;
  beerScores?: number[];
  description?: string;
  images?: Image[];
  websiteURL?: string;
};

export type CordsData = {
  startCords: LatLng | null;
  endCords: LatLng | null;
};

export type ListItem = {
  id: string | number;
  content: string;
};

export type MapProps = {
  start: LatLng;
  end: LatLng;
  tripId?: string | number;
};

export type RestaurantDto = {
  id: string;
  restaurantName: string;
  location: LatLng;
  beerScoreAverage: number;
  description: string;
};
