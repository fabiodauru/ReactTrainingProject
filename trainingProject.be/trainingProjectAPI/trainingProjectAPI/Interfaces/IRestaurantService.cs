using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IRestaurantService
{
    Task<Restaurant> CreateRestaurantAsync(CreateRestaurantRequestDto restaurantDto);

    Task<List<Restaurant>> GetClosestRestaurantAsync(Coordinates start, Coordinates end);
    
    
}
