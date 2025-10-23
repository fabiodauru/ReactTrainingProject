using System.Text.RegularExpressions;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

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
    public async Task<ServiceResponse<GetAllResponseDto<Restaurant>>> GetAllRestaurants()
    {
        throw new NotImplementedException();
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
        var validBeerScore = !restaurant.BeerScore.HasValue || (restaurant.BeerScore.Value >= 1 && restaurant.BeerScore.Value <= 5);
        var validWebsiteURL = string.IsNullOrEmpty(restaurant.WebsiteURL);
        bool[] checks = [noExistingRestaurant, hasCreator, hasNameSyntax, hasValidLocation, validBeerScore, validWebsiteURL];
        return Task.FromResult(checks.All(v => v));
    }
}
