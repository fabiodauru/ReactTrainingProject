using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;
using trainingProjectAPI.Services;

namespace trainingProjectAPI.Controllers;

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

    [HttpPost]
    public async Task<IActionResult> PostTrip([FromBody] CreateTripRequestDto? trip)
    {
        if (trip == null || trip.CreatedBy == Guid.Empty)
        {
            _logger.LogWarning("Invalid request");
            return BadRequest("Invalid request"); //TODO better error Management
        }
        
        var res  = await _tripService.CreateTripAsync(trip);

        switch (res.Message)
        {
            case ServiceMessage.Success:
                return Ok(res);
            case ServiceMessage.Error:
                return BadRequest(res);
            case ServiceMessage.NotFound:
                return NotFound(res);
            case ServiceMessage.Existing:
                return BadRequest(res);
            case ServiceMessage.Invalid:
                return BadRequest(res);
            default:
                return BadRequest();
        }
    }
}