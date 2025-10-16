using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
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
    public async Task<ActionResult<ListResponseDto<TripReponseDto>>> Trips()
    {
        var empty = new ListResponseDto<TripReponseDto> { Items = new List<TripReponseDto>() };

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
    public async Task<IActionResult> PostTrip([FromBody] CreateTripRequestDto? trip)
    {
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
}
