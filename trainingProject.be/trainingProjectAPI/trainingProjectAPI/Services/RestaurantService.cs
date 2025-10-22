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
            //TODO validate restaurant
            
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
}
