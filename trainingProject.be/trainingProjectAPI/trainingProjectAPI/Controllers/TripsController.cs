using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Services;

namespace trainingProjectAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class TripControllers : ControllerBase
{
    private readonly ILogger<TripControllers> _logger;
    private readonly ITripService _tripService;
    public TripControllers(ITripService tripService, ILogger<TripControllers> logger)
    {
        _logger = logger;
        _tripService = tripService;
    }

    [HttpPost]
    public async Task<IActionResult> PostTrip([FromBody] CreateTripRequestDto trip)
    {
        if (trip == null || trip.CreatedBy == Guid.Empty)
        {
            _logger.LogWarning("Invalid request");
            return BadRequest("Invalid request"); //TODO better error Management
        }
        
        
        
        return Ok();
    }
    
}