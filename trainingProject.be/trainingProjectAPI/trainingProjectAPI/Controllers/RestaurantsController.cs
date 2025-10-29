using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;
using trainingProjectAPI.Services;

namespace trainingProjectAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly ILogger<RestaurantsController> _logger;
    private readonly IRestaurantService _restaurantService; 

    public RestaurantsController(IRestaurantService restaurantService, ILogger<RestaurantsController> logger)
    {
        _logger = logger;
        _restaurantService = restaurantService;
    }

    [HttpPost]
    public async Task<IActionResult> PostRestaurant([FromBody] CreateRestaurantRequestDto dto)
    {
        var response = await _restaurantService.CreateRestaurantAsync(FillInUserId(dto));
        return Ok(response);
    }

    [HttpGet("closest")]
    public async Task<ActionResult<ListResponseDto<Restaurant>>> GetClosestRestaurants([FromQuery] GetClosestrestaurantRequestDto dto)
    {
        var response = await _restaurantService.GetClosestRestaurantAsync(dto);
        return Ok(response);
    }

    private CreateRestaurantRequestDto FillInUserId(CreateRestaurantRequestDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            throw new NotFoundException("User not found");
        }
        Guid.TryParse(userIdString, out var userId);
        dto.Images?.ForEach(i => i.UserId = userId);
        dto.CreatedBy = userId;
        return dto;
    }
}
