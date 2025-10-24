using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IRestaurantService
{
    Task<ServiceResponse<GetAllResponseDto<Restaurant>>> GetClosestRestaurantsAsync(RequestClosestRestaurantDto tripStartStop);

    Task<ServiceResponse<CreateResponseDto>> CreateRestaurantAsync(Restaurant? restaurant);

    Task<ListResponseDto<Image>> GetRestaurantImagesAsync(Guid restaurantId);

    Task<ServiceResponse<Trip>> DeleteRestaurantAsync(Guid restaurantId, Guid userGuid);
    
}
