using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Services;

public class TripService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<TripService> _logger;
    private List<Trip> _trips;
    
    
    public TripService(IPersistencyService persistencyService, ILogger<TripService> logger)
    {
        _persistencyService = persistencyService;
        _logger = logger;
    }

    public async Task<List<Trip>> GetAllTrips()
    {
        
        var response = await _persistencyService.ReadAsync<Trip>();

        

        return null;
    }

    //TODO Create AddTrip
    public async Task<ServiceResponse<Trip>> AddTrip(Trip trip)
    {
        Trip? result = null;
        var message = ServiceMessage.Invalid;

        
        
        return new ServiceResponse<Trip>()
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
    
}