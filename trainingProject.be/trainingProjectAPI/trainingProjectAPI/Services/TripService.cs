using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Services;

public class TripService : ITripService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<TripService> _logger;
    
    
    public TripService(IPersistencyService persistencyService, ILogger<TripService> logger)
    {
        _persistencyService = persistencyService;
        _logger = logger;
    }
    
    public async Task<ServiceResponse<GetAllResponseDto<Trip>>> GetAllTrips()
    {
        ServiceMessage message;
        List<Trip>? trips = null;
        try
        {
            var response = await _persistencyService.ReadAsync<Trip>();
            if (!response.Found)
            {
                throw new Exception();
            }
            if (response.Results != null)
            {
                trips = response.Results;
                message = ServiceMessage.Success;
                _logger.LogInformation($"Found {trips.Count} trips");
            }
            else
            {
                trips = new List<Trip>();
                message = ServiceMessage.NotFound;
                _logger.LogWarning("No trips found");
            }
        }
        catch (Exception)
        {
            message = ServiceMessage.Error;
            _logger.LogError("Error loading trips");
        }

        var dto = new GetAllResponseDto<Trip>()
        {
            Result = trips
        };
        
        return new ServiceResponse<GetAllResponseDto<Trip>>
        {
            Message = message,
            Result = dto
        };
    }
    
    public async Task<ServiceResponse<CreateResponseDto>> CreateTripAsync(Trip trip)
    {
        ServiceMessage message;
        try
        {
            var createResponse = await _persistencyService.CreateAsync(trip);
            if (createResponse.Acknowledged)
            {
                message = ServiceMessage.Success;
                _logger.LogInformation($"Trip {createResponse.Result!.TripName} created on {createResponse.CreatedOn}");
            }
            else
            {
                throw new Exception("Error by setting trip");
            }
        }
        catch (Exception)
        {
            message = ServiceMessage.Error;
            _logger.LogError($"Error by creating trip: {trip.TripName}");
        }

        var dto = new CreateResponseDto
        {
            Name = trip.TripName,
        };
        
        return new ServiceResponse<CreateResponseDto>
        {
            Message = message,
            Result = dto
        };
        
        //Fals Trips gleichen Namen haben dürfen gut, sonst dies noch prüfen
    }
    

    //TODO Create Validator
    /*private bool ValidateTrip(Trip trip)
    {
        if()
        
        //   :)
        //    if() holy moly macarony
        
        return false;
    }*/
    
}