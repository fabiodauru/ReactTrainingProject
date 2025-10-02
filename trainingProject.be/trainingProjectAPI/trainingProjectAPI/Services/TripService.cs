using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Services;

public class TripService : ITripService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<TripService> _logger;
    private List<Trip> _trips;
    
    
    public TripService(IPersistencyService persistencyService, ILogger<TripService> logger)
    {
        _persistencyService = persistencyService;
        _logger = logger;
    }

    /*//TODO Read all trips
    public async Task<List<Trip>> GetAllTrips()
    {
        var response = await _persistencyService.ReadAsync<Trip>();
        
        

        return null;
    }*/
    
    //TODO Create Error handling for existing trip
    public async Task<ServiceResponse<CreateTripResponseDto>> CreateTripAsync(Trip trip)
    {
        var message = ServiceMessage.Invalid;
        CreateTripResponseDto? result = null;

        var createResponse = await _persistencyService.CreateAsync(trip);
        if (createResponse.Acknowledged)
        {
            message = ServiceMessage.Success;
            _logger.LogInformation($"Trip {createResponse.Result!.TripName} created on {createResponse.CreatedOn}");
            
            result = new CreateTripResponseDto
            {
                Id = createResponse.Result!.Id,
                TripName = createResponse.Result!.TripName
            };
        }
        
        return new ServiceResponse<CreateTripResponseDto>()
        {
            Message = message,
            Result = result
        };
    }

    //TODO Create Validator
    /*private bool ValidateTrip(Trip trip)
    {
        if()
        
        
        return false;
    }*/
    
    //TODO CreateTripResponse DTO
}