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
public class TripsController : ControllerBase
{
    private readonly ILogger<TripsController> _logger;
    private readonly ITripService _tripService;

    public TripsController(ITripService tripService, ILogger<TripsController> logger)
    {
        _logger = logger;
        _tripService = tripService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTrips()
    {
        var res = await _tripService.GetAllTrips();
        return Ok(res);
    }

    [HttpGet("user")]
    public async Task<ActionResult<ListResponseDto<TripResponseDto>>> Trips()
    {
        var empty = new ListResponseDto<TripResponseDto> { Items = new List<TripResponseDto>() };

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            _logger.LogWarning("No user ID found in claims.");
            return Ok(empty);
        }

        var response = await _tripService.GetUserTripsAsync(userId);
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> PostTrip([FromBody] CreateTripRequestDto? tripDto)
    {
        if (tripDto != null)
        {
            var trip = TripMapper(tripDto);
        
            var res = await _tripService.CreateTripAsync(trip);

            return res.Message switch
            {
                ServiceMessage.Success => Ok(res),
                ServiceMessage.Invalid => BadRequest(new { error = "Invalid data", message = "The trip data is invalid" }),
                ServiceMessage.NotFound => NotFound(new { error = "User not found", message = "Creator user was not found" }),
                ServiceMessage.Existing => Conflict(new { error = "Trip already exists", message = "A trip with this name already exists" }),
                ServiceMessage.Error => StatusCode(500, new { error = "Internal server error", message = "An error occurred while creating the trip" }),
                _ => StatusCode(500, new { error = "Unknown error", message = "An unexpected error occurred" })
            };
        }
        return BadRequest(new { error = "Invalid request", message = "Trip data is required" });
    }

    [HttpGet("images/{tripId}")]
    public async Task<ActionResult<ListResponseDto<Image>>> GetTripImages(Guid tripId)
    {
        var response = await _tripService.GetTripImagesAsync(tripId);
        return Ok(response);
    }

    [HttpDelete("{tripId}")]
    public async Task<IActionResult> DeleteTrip(Guid tripId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userId, out var userGuid))
            return Forbid();

        var result = await _tripService.DeleteTripAsync(tripId, userGuid);

        return result.Message switch
        {
            ServiceMessage.NotFound => NotFound(new { error = "Trip not found", message = $"Trip with ID {tripId} does not exist" }),
            ServiceMessage.Error => StatusCode(500, new { error = "Internal server error", message = "An error occurred while deleting the trip" }),
            ServiceMessage.Success => Ok(result),
            _ => StatusCode(500, new { error = "Unknown error", message = "An unexpected error occurred" })
        };
    }
    
    private Trip? TripMapper(CreateTripRequestDto trip)
    {
        var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(user))
        {
            Guid.TryParse(user, out var userId);
        
            double averageWalkingSpeedKph = 5.0;
            double timeInHours = trip.Distance / averageWalkingSpeedKph / 1000;
            TimeSpan walkingDuration = TimeSpan.FromHours(timeInHours);

            int difficulty = CalculateDifficulty(trip.Distance);

            List<Image> theImages = CreateListOfImages(trip.Images, userId);

            return new Trip
            {
                StartCoordinates = trip.StartCoordinates,
                EndCoordinates = trip.EndCoordinates,
                TripName = trip.TripName,
                CreatedBy = userId,
                Images = theImages,
                Restaurants = trip.Restaurants,
                Duration = walkingDuration,
                Elevation = trip.Elevation,
                Distance = trip.Distance,
                Difficulty = difficulty,
                Description = trip.Description,
            };
        }

        _logger.LogWarning("No user ID found in claims.");
        return null;
    }

    private List<Image> CreateListOfImages(List<Image> images, Guid creatorId)
    {
        List<Image> newImages = new List<Image>();
        
        foreach (var image in images)
        {
            new Image
            {
                ImageFile = image.ImageFile,
                UserId = creatorId,
                Description = image.Description,
            };
            newImages.Add(image);
        }
        return newImages;
    }


    private int CalculateDifficulty(double distance)
    {
        
        double elevation = 1; //TODO: Placeholder for elevation gain in meters
        if (distance <= 0)
        {
            if (elevation > 0) return 5;
            return 1;
        }
    
        double angleRadians = Math.Atan(elevation / distance);
        double angleDegrees = angleRadians * (180 / Math.PI);

        int difficultyRating = angleDegrees switch
        {
            <= 2 => 1,
            <= 5 => 2,  
            <= 10 => 3, 
            <= 18 => 4, 
            _ => 5      
        };
    
        int distanceRating = distance switch
        {
            <= 1000 => 1,  
            <= 5000 => 2,
            <= 10000 => 3, 
            <= 20000 => 4, 
            _ => 5         
        };
    
        double combinedScore = (double)(difficultyRating + distanceRating) / 2.0;
        int finalRating = (int)Math.Round(combinedScore, MidpointRounding.AwayFromZero);
    
        return Math.Max(1, Math.Min(5, finalRating));
    }
}
