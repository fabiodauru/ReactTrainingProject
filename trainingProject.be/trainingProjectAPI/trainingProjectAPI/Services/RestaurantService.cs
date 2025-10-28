using System.Text.RegularExpressions;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;
using trainingProjectAPI.Models.ResultObjects;

namespace trainingProjectAPI.Services;

public class RestaurantService : IRestaurantService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<RestaurantService> _logger;

    public RestaurantService(IPersistencyService persistencyService, ILogger<RestaurantService> logger)
    {
        _persistencyService = persistencyService;
        _logger = logger;
    }

    public async Task<ServiceResponse<CreateResponseDto>> CreateRestaurantAsync(Restaurant? restaurant)
    {
        if (restaurant == null)
        {
            _logger.LogWarning("Invalid restaurant creation request: restaurant object is null.");
            return new ServiceResponse<CreateResponseDto>
            {
                Message = ServiceMessage.Invalid,
                Result = new CreateResponseDto { Name = string.Empty }
            };
        }

        try
        {
            var user = await _persistencyService.FindByIdAsync<User>(restaurant.CreatedBy);
            if (!user.Found || user.Result == null)
            {
                _logger.LogWarning("User {UserId} not found", restaurant.CreatedBy);
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.NotFound,
                    Result = new CreateResponseDto { Name = restaurant.RestaurantName }
                };
            }
            
            var RestaurantRead = await _persistencyService.ReadAsync<Restaurant>();
            if (!RestaurantRead.Found)
            {
                _logger.LogError("Error loading trips for validation");
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Error,
                    Result = new CreateResponseDto { Name = restaurant.RestaurantName }
                };
            }
            
            var isValid = await ValidateRestaurant(RestaurantRead.Results, restaurant);
            if (!isValid)
            {
                _logger.LogWarning("Trip validation failed for {TripName}", restaurant.RestaurantName);
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Invalid,
                    Result = new CreateResponseDto { Name = restaurant.RestaurantName }
                };
            }
            
            var createResponse = await _persistencyService.CreateAsync(restaurant);
            if (!createResponse.Acknowledged)
            {
                _logger.LogError("Persistency did not acknowledge trip creation");
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Error,
                    Result = new CreateResponseDto { Name = restaurant.RestaurantName }
                };
            }
            
            _logger.LogInformation("Created Restaurant {RestaurantName}", restaurant.RestaurantName);
            return new ServiceResponse<CreateResponseDto>
            {
                Message = ServiceMessage.Success,
                Result = new CreateResponseDto { Name = restaurant.RestaurantName }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while creating Restaurant");
            return new ServiceResponse<CreateResponseDto>
            {
                Message = ServiceMessage.Error,
                Result = new CreateResponseDto { Name = restaurant.RestaurantName }
            };
        }
    }
    
    //TODO GetAllRestaurants(), GetRestaurantImagesAsync(), DeleteRestaurantAsync()
    public async Task<ServiceResponse<GetAllResponseDto<Restaurant>>> GetClosestRestaurantsAsync(RequestClosestRestaurantDto tripStartStop)
    {
        ReadResult<Restaurant> restaurantsResult = await _persistencyService.ReadAsync<Restaurant>();
        
        if (!restaurantsResult.Found)
        {
            _logger.LogError("Persistency read failed for restaurants.");
            return new ServiceResponse<GetAllResponseDto<Restaurant>>
            {
                Message = ServiceMessage.Error,
                Result = null
            };
        }
        
        List<Restaurant> restaurants = restaurantsResult.Results;
        
        if (restaurants.Count == 0)
        {
            _logger.LogInformation("No restaurants found in the database.");
            return new ServiceResponse<GetAllResponseDto<Restaurant>>
            {
                Message = ServiceMessage.NotFound,
                Result = null
            };
        }
        
        var restaurantsWithDistance = restaurants.Select(restaurant => new 
        {
            Restaurant = restaurant,
            Distance = CalculateDistanceToTrip(tripStartStop.StartCoordinates,tripStartStop.EndCoordinates , restaurant.Location.Coordinates), 
        });
        
        var sortedRestaurants = restaurantsWithDistance
            .OrderBy(restaurant => restaurant.Distance)
            .Select(Restaurant => Restaurant.Restaurant).ToList();
        
        
        List<Restaurant> top10Restaurants = sortedRestaurants.Take(10).ToList();
        _logger.LogInformation("Search and sorted restaurants");
        return new ServiceResponse<GetAllResponseDto<Restaurant>>
        {
            Message = ServiceMessage.Success,
            Result = new GetAllResponseDto<Restaurant>
            {
                Results = top10Restaurants
            }
        };
    }

    private double CalculateDistanceToTrip(Coordinates start, Coordinates stop, Coordinates restaurantCoordinates)
    {
        Coordinates a = start;
        Coordinates b = stop;
        Coordinates p = restaurantCoordinates;
        
        double segmentLength = CalculateDistanceBetweenPoints(a, b);
        double segmentLengthSquared = segmentLength * segmentLength;
        
        if (segmentLengthSquared == 0.0)
        {
            return CalculateDistanceBetweenPoints(a, p);
        }
        
        double dotProduct = 
            ((p.Longitude - a.Longitude) * (b.Longitude - a.Longitude)) + 
            ((p.Latitude - a.Latitude) * (b.Latitude - a.Latitude));
        
        double t = dotProduct / segmentLengthSquared;
        
        double closestDistance;

        if (t < 0.0)
        {
            closestDistance = CalculateDistanceBetweenPoints(a, p);
        }
        else if (t > 1.0)
        {
            closestDistance = CalculateDistanceBetweenPoints(b, p);
        }
        else
        {
            double projectedLon = a.Longitude + t * (b.Longitude - a.Longitude);
            double projectedLat = a.Latitude + t * (b.Latitude - a.Latitude);
            
            Coordinates projectedPoint = new Coordinates
            {
                Longitude = projectedLon,
                Latitude = projectedLat
            };
            
            closestDistance = CalculateDistanceBetweenPoints(projectedPoint, p);
        }

        return closestDistance;
    }
    
    private double CalculateDistanceBetweenPoints(Coordinates point1, Coordinates point2)
    {
        double dLon = point2.Longitude - point1.Longitude;
        double dLat = point2.Latitude - point1.Latitude;
        double distanceSquared = (dLon * dLon) + (dLat * dLat);
        
        return Math.Sqrt(distanceSquared);
    }
    public async Task<ListResponseDto<Image>> GetRestaurantImagesAsync(Guid restaurantId)
    {
        throw new NotImplementedException();
    }
    public async Task<ServiceResponse<Trip>> DeleteRestaurantAsync(Guid restaurantId, Guid userGuid)
    {
        throw new NotImplementedException();
    }
    
    private Task<bool> ValidateRestaurant(List<Restaurant>? existingRestaurants, Restaurant restaurant)
    {
        var noExistingRestaurant = existingRestaurants?.FirstOrDefault(
            r => r.RestaurantName.Equals(restaurant.RestaurantName, StringComparison.OrdinalIgnoreCase) 
                 && r.CreatedBy == restaurant.CreatedBy
        ) == null;
        var hasCreator = restaurant.CreatedBy != Guid.Empty;
        var hasNameSyntax = Regex.IsMatch(restaurant.RestaurantName, @"^[\w\s\-]{3,100}$", RegexOptions.CultureInvariant);
        var hasValidLocation = restaurant.Location != null; 
        var validBeerScore = !restaurant.BeerScoreAverage.HasValue || (restaurant.BeerScoreAverage.Value >= 0 && restaurant.BeerScoreAverage.Value <= 10);
        var validWebsiteURL = !string.IsNullOrEmpty(restaurant.WebsiteURL);
        bool[] checks = [noExistingRestaurant, hasCreator, hasNameSyntax, hasValidLocation, validBeerScore, validWebsiteURL];
        return Task.FromResult(checks.All(v => v));
    }
}
