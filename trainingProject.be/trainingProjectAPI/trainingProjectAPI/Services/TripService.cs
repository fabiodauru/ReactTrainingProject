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
    
    public async Task<ServiceResponse<GetAllTripsResponseDto>> GetAllTrips()
    {
        GetAllTripsResponseDto? trips = null;
        var message = ServiceMessage.Invalid;
        
        try
        {
            var response = await _persistencyService.ReadAsync<Trip>();

            if (response is { Found: true, Results: not null })
            {
                var tripsFound = response.Results;
            
                trips = new GetAllTripsResponseDto(){ Trips = tripsFound };
            
                message = ServiceMessage.Success;
                _logger.LogInformation($"Found {tripsFound.Count} trips");
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
        
        return new ServiceResponse<GetAllTripsResponseDto>
        {
            Message = message,
            Result = trips
        };
    }
    
    //TODO Create Error handling for existing trip
    public async Task<ServiceResponse<CreateTripResponseDto>> CreateTripAsync(CreateTripRequestDto trip)
    {
        var message = ServiceMessage.Invalid;
        CreateTripResponseDto? result = null;
        
        var tripToCreate = TripMapper(trip);

        var createResponse = await _persistencyService.CreateAsync(tripToCreate);
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
        
        return new ServiceResponse<CreateTripResponseDto>
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
    
    public Trip TripMapper(CreateTripRequestDto trip)
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