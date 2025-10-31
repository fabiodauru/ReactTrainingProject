using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Controllers;

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
        dto.Images?.ForEach(i => i.UserId = this.GetUserId());
        dto.CreatedBy = this.GetUserId();
        var response = await _restaurantService.CreateRestaurantAsync(dto);
        return Ok(response);
    }

    [HttpGet("closest")]
    public async Task<IActionResult> GetClosestRestaurants([FromQuery] GetClosestrestaurantRequestDto dto)
    {
        var response = await _restaurantService.GetClosestRestaurantAsync(dto);
        return Ok(response);
    }
    
}
