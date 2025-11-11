using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.Features.UserFeature;
using trainingProjectAPI.Infrastructure;
using trainingProjectAPI.Models.DTOs.TripRequestDTOs;

namespace trainingProjectAPI.Features.TripFeature;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;
    private readonly IUserService _userService;

    public TripsController(ITripService tripService, IUserService userService)
    {
        _tripService = tripService;
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTrips()
    {
        var response = await _tripService.GetAllTripsAsync();
        return Ok(response);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var creator = this.GetUserId();
        var response = await _tripService.GetTripsByPropertyAsync("CreatedBy", creator);
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> PostTrip([FromBody] CreateTripRequestDto tripDto)
    {
        var creatorId = this.GetUserId();
        var response =  await _tripService.CreateTripAsync(creatorId, tripDto);
        return Ok(response);
    }

    [HttpGet("{tripId}")]
    public async Task<ActionResult<Models.Domain.Trip>> GetTrip(Guid tripId)
    {
        var response = await _tripService.GetTripByIdAsync(tripId);
        return Ok(response);
    }

    [HttpGet("creator/{creatorUsername}")]
    public async Task<IActionResult> UserTrips(string creatorUsername)
    {
        var response = _userService.GetUserByPropertyAsync("Username",  creatorUsername);
        var trips = await _tripService.GetTripsByPropertyAsync("CreatedBy", response.Result.Id);
        return Ok(trips);
    }
    
    [HttpDelete("{tripId}")]
    public async Task<IActionResult> DeleteTrip(Guid tripId)
    {
        await _tripService.DeleteTripAsync(tripId);
        return Ok();
    }
}
