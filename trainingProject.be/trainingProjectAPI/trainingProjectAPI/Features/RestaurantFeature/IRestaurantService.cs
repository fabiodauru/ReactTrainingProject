using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.RestaurantRequestDTOs;

namespace trainingProjectAPI.Features.RestaurantFeature;

public interface IRestaurantService
{
    Task<Restaurant> CreateRestaurantAsync(CreateRestaurantRequestDto restaurantDto, Guid creatorId);

    Task<List<Restaurant>> GetClosestRestaurantAsync(GetClosestrestaurantRequestDto dto);

    Task<Restaurant> UpdateBeerScoreAsync(UpdateBeerScorerequestDTO dto);
}
