using trainingProjectAPI.Models.DTOs.RestaurantRequestDTOs;

namespace trainingProjectAPI.Features.RestaurantFeature;

public interface IRestaurantService
{
    Task<Models.Domain.Restaurant> CreateRestaurantAsync(CreateRestaurantRequestDto restaurantDto, Guid creatorId);

    Task<List<Models.Domain.Restaurant>> GetClosestRestaurantAsync(GetClosestrestaurantRequestDto dto);
    
    
}
