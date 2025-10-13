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
[Route("[controller]")]
public class TripsController : ControllerBase
{
    private readonly ILogger<TripsController> _logger;
    private readonly ITripService _tripService;
    private readonly IPersistencyService _persistencyService;

    public TripsController(ITripService tripService, ILogger<TripsController> logger, IPersistencyService persistencyService)
    {
        _logger = logger;
        _tripService = tripService;
        _persistencyService = persistencyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTrips()
    {
        var res = await _tripService.GetAllTrips();
        return Ok(res);
    }

    [HttpGet("user")]
    public async Task<ListResponseDto<TripReponseDto>> Trips()
    {
        var response = new ListResponseDto<TripReponseDto>
        {
            Items = new List<TripReponseDto>()
        };

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("No user ID found in claims.");
                return response;
            }

            var user = await _persistencyService.FindByIdAsync<User>(Guid.Parse(userId));
            if (!user.Found || user.Result == null)
            {
                _logger.LogWarning($"User with ID {userId} not found.");
                return response;
            }

            var tripDtos = user.Result.Trips.Select(t => new TripReponseDto
            {
                Trip = t,
                CreatedByUsername = user.Result.Username,
                CreatedByProfilePictureUrl = user.Result.ProfilePictureUrl
            }).ToList();

            _logger.LogInformation("Successfully retrieved user's trips.");
            return new ListResponseDto<TripReponseDto>
            {
                Items = tripDtos
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user's trips.");
            return response;
        }
    }

    [HttpPost]
    public async Task<IActionResult> PostTrip([FromBody] CreateTripRequestDto? trip)
    {
        if (trip == null || trip.CreatedBy == Guid.Empty)
        {
            _logger.LogWarning("Invalid trip request: trip is null or CreatedBy is empty");
            return BadRequest(new { error = "Invalid request", message = "Trip data is required and must include a valid creator ID" });
        }

        var user = await _persistencyService.FindByIdAsync<User>(trip.CreatedBy);
        if (!user.Found || user.Result == null)
        {
            _logger.LogWarning($"User {trip.CreatedBy} not found");
            return NotFound(new { error = "User not found", message = $"User with ID {trip.CreatedBy} does not exist" });
        }

        var tripMapped = TripMapper(trip);
        var res = await _tripService.CreateTripAsync(tripMapped);

        if (res.Message == trainingProjectAPI.Models.Enums.ServiceMessage.Success)
        {
            user.Result.Trips.Add(tripMapped);
            var updateResult = await _persistencyService.UpdateAsync(trip.CreatedBy, user.Result);

            if (!updateResult.Acknowledged)
            {
                _logger.LogError($"Failed to update user {trip.CreatedBy} with new trip {tripMapped.Id}");
                return StatusCode(500, new { error = "Internal server error", message = "Trip created but failed to update user profile" });
            }

            _logger.LogInformation($"Trip {tripMapped.Id} created and added to user {user.Result.Username}");
            return Ok(res);
        }

        return res.Message switch
        {
            trainingProjectAPI.Models.Enums.ServiceMessage.Existing => Conflict(new { error = "Trip already exists", message = "A trip with this name already exists" }),
            trainingProjectAPI.Models.Enums.ServiceMessage.Invalid => BadRequest(new { error = "Invalid data", message = "The trip data is invalid" }),
            trainingProjectAPI.Models.Enums.ServiceMessage.Error => StatusCode(500, new { error = "Internal server error", message = "An error occurred while creating the trip" }),
            _ => StatusCode(500, new { error = "Unknown error", message = "An unexpected error occurred" })
        };
    }

    private Trip TripMapper(CreateTripRequestDto trip)
    {
        return new Trip
        {
            StartCoordinates = trip.StartCoordinates,
            EndCoordinates = trip.EndCoordinates,
            TripName = trip.TripName,
            CreatedBy = trip.CreatedBy,
            Images = trip.Images,
            Restaurants = trip.Restaurants,
            Duration = trip.Duration,
            Elevation = trip.Elevation,
            Distance = trip.Distance,
            Difficulty = trip.Difficulty,
            Description = trip.Description,
        };
    }
}
