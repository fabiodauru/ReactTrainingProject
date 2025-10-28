using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using trainingProjectAPI.DTOs;
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
    public async Task<IActionResult> PostRestaurant([FromBody] CreateRestaurantRequestDto? restaurantDto)
    {
        if (restaurantDto != null)
        {
            var restaurant = RestaurantMapper(restaurantDto);
            
            if (restaurant == null)
            {
                return Forbid();
            }
            
            var res = await _restaurantService.CreateRestaurantAsync(restaurant);
            
            return res.Message switch
            {
                ServiceMessage.Success => Ok(res),
                ServiceMessage.Invalid => BadRequest(new { error = "Invalid data", message = "The Restaurant data is invalid" }),
                ServiceMessage.NotFound => NotFound(new { error = "User not found", message = "Creator user was not found" }),
                ServiceMessage.Existing => Conflict(new { error = "Restaurant already exists", message = "A Restaurant with this name already exists" }),
                ServiceMessage.Error => StatusCode(500, new { error = "Internal server error", message = "An error occurred while creating the Restaurant" }),
                _ => StatusCode(500, new { error = "Unknown error", message = "An unexpected error occurred" })
            };
        }
        
        return BadRequest(new { error = "Invalid request", message = "Restaurant data is required" });
    }

    [HttpGet("closest")]
    public async Task<ActionResult<ListResponseDto<Restaurant>>> GetClosestRestaurants([FromQuery] RequestClosestRestaurantDto? tripStartStop)
    {
        _logger.LogInformation("QueryString: {q}", HttpContext.Request.QueryString.Value);
        _logger.LogInformation("Bound DTO: {dto}", System.Text.Json.JsonSerializer.Serialize(tripStartStop));

        if (tripStartStop == null)
            return BadRequest(new { error = "Missing coordinates" });

        var response = await _restaurantService.GetClosestRestaurantsAsync(tripStartStop);
        return Ok(response);
    }


    
    private Restaurant? RestaurantMapper(CreateRestaurantRequestDto dto)
    {
        var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(user))
        {
            Guid.TryParse(user, out var userId);
            
            Address defaultAddress = new Address
            {
                Street = "Pöltisstrasse 40",
                ZipCode = "8887",
                City = "Mels",
                Country = "Switzerland",
            };

            Coordinates coordinates = new Coordinates
            {
                Latitude = dto.Location.Latitude,
                Longitude = dto.Location.Longitude,
            };
            
            Location theLocation = new Location
            {
                Address = defaultAddress,
                Coordinates = coordinates,
            };
            List<Image> theImages = CreateListOfImages(dto.Images, userId, theLocation);

            return new Restaurant
            {
                RestaurantName = dto.RestaurantName,
                CreatedBy = userId,
                Location = theLocation,
                BeerScoreAverage = dto.BeerScore,
                BeerScores = new List<int> { dto.BeerScore },
                Description = dto.Description,
                WebsiteURL = dto.WebsiteURL,
                Images = theImages
            };
        }
        
        _logger.LogWarning("No user ID found in claims.");
        return null;
    }
    
    private List<Image> CreateListOfImages(List<Image> images, Guid creatorId, Location location)
    {
        List<Image> newImages = new List<Image>();
        
        foreach (var image in images)
        {
            Image theImage = new Image
            {
                ImageFile = image.ImageFile,
                UserId = creatorId,
                Description = image.Description,
                Coordinates = location.Coordinates,
            };
            newImages.Add(theImage);
        }
        return newImages;
    }
}
