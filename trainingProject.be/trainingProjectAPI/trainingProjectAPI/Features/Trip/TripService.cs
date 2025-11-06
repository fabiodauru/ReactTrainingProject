using AutoMapper;
using trainingProjectAPI.DTOs.TripRequestDTOs;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.PersistencyService;

namespace trainingProjectAPI.Services;

public class TripService : ITripService
{
    private readonly IPersistencyService  _persistencyService;
    private readonly ILogger<TripService> _logger;
    private readonly IMapper _mapper;

    public TripService(IPersistencyService persistencyService, ILogger<TripService> logger, IMapper mapper)
    {
        _persistencyService = persistencyService;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<List<Trip>> GetAllTripsAsync()
    {
        try
        {
            var response = await _persistencyService.ReadAsync<Trip>() ?? throw new NotFoundException("Trip not found");
            _logger.LogInformation("Got all trips");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading all trips");
            throw;
        }
    }

    public async Task<Trip> CreateTripAsync(CreateTripRequestDto tripDto, Guid creatorId)
    {
        try
        {
            var trip = _mapper.Map<Trip>(tripDto);
            trip.Difficulty = CalculateDifficulty(trip.Distance);
            trip.Duration = CalculateDuration(trip.Distance);
            if (string.IsNullOrEmpty(trip.TripName) || string.IsNullOrWhiteSpace(trip.CreatedBy.ToString()))
            {
                throw new ValidationException("Name or CreatedBy is empty");
            }
            var creator = await _persistencyService.FindByIdAsync<User>(creatorId) ?? throw new NotFoundException("Creator not found");
            creator.Trips.Add(trip.Id);
            var responseUser = await _persistencyService.FindAndUpdateByPropertyAsync<User>(trip.CreatedBy, "Trips", creator.Trips!) ?? throw new ConflictException("Creator not updated");
            var responseTrip = await _persistencyService.CreateAsync(trip);
            _logger.LogInformation($"Created trip {responseTrip.TripName} and updated {responseUser.Username}");
            return responseTrip;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating trip");
            throw;
        }
    }

    public async Task DeleteTripAsync(Guid tripId)
    {
        try
        {
            var trip = await _persistencyService.FindByIdAsync<Trip>(tripId) ?? throw new NotFoundException("Trip not found");
            var creator = await _persistencyService.FindByIdAsync<User>(trip.CreatedBy) ??
                          throw new NotFoundException("Creator not found");
            creator.Trips!.Remove(tripId);
            var response = await _persistencyService.FindAndUpdateByPropertyAsync<User>(creator.Id, "Trips", creator.Trips!) ??
                           throw new ConflictException("Creator not updated");
            await _persistencyService.DeleteAsync<Trip>(tripId);
            _logger.LogInformation($"Trip {trip.TripName} deleted and updated {response.Username}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting trip");
            throw;
        }
    }

    public async Task<Trip> GetTripByIdAsync(Guid tripId)
    {
        try
        {
            var response = await _persistencyService.FindByIdAsync<Trip>(tripId) ??  throw new NotFoundException("Trip not found");
            _logger.LogInformation($"Trip {response.TripName} found");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving trip {TripId}.", tripId);
            throw;
        }
    }

    public async Task<List<Trip>> GetTripsByPropertyAsync(string property, object value)
    {
        try
        {
            if (string.IsNullOrEmpty(property))
            {
                throw new ValidationException("Property name is empty");
            }

            var response = await _persistencyService.FindByPropertyAsync<Trip>(property, value) ?? throw new NotFoundException("Trip not found");
            _logger.LogInformation($"Trips for {property}: {value} found");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trips by {Property}: {Value}",  property, value.ToString());
            throw;
        }
    }

    /*private Task<bool> ValidateTrip(List<Trip>? trips, Trip trip)
    {
        var noExistingTrip = trips?.FirstOrDefault(t => t.TripName == trip.TripName && t.CreatedBy == trip.CreatedBy) == null;
        var hasCreator = trip.CreatedBy != Guid.Empty;
        var hasNameSyntax = Regex.IsMatch(trip.TripName, @"^[\w\s\-]{3,100}$", RegexOptions.CultureInvariant);
        var hasPositiveDistance = trip.Distance > 0;
        var validDuration = !trip.Duration.HasValue || trip.Duration.Value > TimeSpan.Zero;
        var validDifficulty = !trip.Difficulty.HasValue || (trip.Difficulty.Value >= 1 && trip.Difficulty.Value <= 5);
        bool[] checks = [noExistingTrip, hasCreator, hasNameSyntax, hasPositiveDistance, validDuration, validDifficulty];
        return Task.FromResult(checks.All(v => v));
    }*/
    
    private int CalculateDifficulty(double distance)
    {
        double elevation = 1; //TODO: Placeholder for elevation gain in meters
        if (distance <= 0)
        {
            if (elevation > 0) return 5;
            return 1;
        }
    
        double angleRadians = Math.Atan(elevation / distance);
        double angleDegrees = angleRadians * (180 / Math.PI);

        int difficultyRating = angleDegrees switch
        {
            <= 2 => 1,
            <= 5 => 2,  
            <= 10 => 3, 
            <= 18 => 4, 
            _ => 5      
        };
    
        int distanceRating = distance switch
        {
            <= 1000 => 1,  
            <= 5000 => 2,
            <= 10000 => 3, 
            <= 20000 => 4, 
            _ => 5         
        };
    
        double combinedScore = (difficultyRating + distanceRating) / 2.0;
        int finalRating = (int)Math.Round(combinedScore, MidpointRounding.AwayFromZero);
    
        return Math.Max(1, Math.Min(5, finalRating));
    }

    private TimeSpan CalculateDuration(double distance)
    {
        double timeInHours = distance / 5.0 / 1000;
        TimeSpan walkingDuration = TimeSpan.FromHours(timeInHours);
        return walkingDuration;
    }
}