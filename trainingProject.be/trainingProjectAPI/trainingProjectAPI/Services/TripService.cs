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
    
    public async Task<ServiceResponse<GetAllTripsResponseDto>> GetAllTrips()
    {
        ServiceMessage message;
        List<Trip>? trips = null;
        try
        {
            var response = await _persistencyService.ReadAsync<Trip>();
            if (response is { Found: true, Results: not null })
            {
                trips = response.Results;
                message = ServiceMessage.Success;
                _logger.LogInformation($"Found {trips.Count} trips");
            }
            else
            {
                message = ServiceMessage.NotFound;
                _logger.LogWarning("Trips not found");
            }
        }
        catch (Exception)
        {
            message = ServiceMessage.Error;
            _logger.LogError("Error loading trips");
        }

        var dto = new GetAllTripsResponseDto()
        {
            Trips = trips
        };
        
        return new ServiceResponse<GetAllTripsResponseDto>
        {
            Message = message,
            Result = dto
        };
    }
    
    public async Task<ServiceResponse<CreateTripResponseDto>> CreateTripAsync(CreateTripRequestDto trip)
    {
        var message = ServiceMessage.Invalid;
        var tripToCreate = TripMapper(trip);
        try
        {
            var createResponse = await _persistencyService.CreateAsync(tripToCreate);
            if (createResponse.Acknowledged)
            {
                message = ServiceMessage.Success;
                _logger.LogInformation($"Trip {createResponse.Result!.TripName} created on {createResponse.CreatedOn}");
            }
        }
        catch (Exception)
        {
            message = ServiceMessage.Error;
            _logger.LogError($"Error by creating trip: {trip.TripName}");
        }

        var dto = new CreateTripResponseDto
        {
            TripName = trip.TripName,
        };
        
        return new ServiceResponse<CreateTripResponseDto>
        {
            Message = message,
            Result = dto
        };
    }

    //TODO Create Validator
    /*private bool ValidateTrip(Trip trip)
    {
        if()
        
        
        return false;
    }*/
    
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