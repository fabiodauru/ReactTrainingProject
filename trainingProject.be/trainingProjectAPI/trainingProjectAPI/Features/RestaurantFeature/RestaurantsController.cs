using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.Infrastructure;
using trainingProjectAPI.Models.DTOs.RestaurantRequestDTOs;

namespace trainingProjectAPI.Features.RestaurantFeature;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly IRestaurantService _restaurantService; 

    public RestaurantsController(IRestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    [HttpPost]
    public async Task<IActionResult> PostRestaurant([FromBody] CreateRestaurantRequestDto dto)
    {
        Guid creatorId = this.GetUserId();
        var response = await _restaurantService.CreateRestaurantAsync(dto, creatorId);
        return Ok(response);
    }

    [HttpGet("closest")]
    public async Task<IActionResult> GetClosestRestaurants([FromQuery] GetClosestrestaurantRequestDto dto)
    {
        var response = await _restaurantService.GetClosestRestaurantAsync(dto);
        return Ok(response);
    }
    
}
