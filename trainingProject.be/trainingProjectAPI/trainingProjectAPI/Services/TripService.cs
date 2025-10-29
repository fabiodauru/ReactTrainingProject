using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.PersistencyService;

namespace trainingProjectAPI.Services;

public class TripService : ITripService
{
    private readonly IPersistencyService  _persistencyService;
    private readonly ILogger<TripService> _logger;

    public TripService(IPersistencyService persistencyService, ILogger<TripService> logger)
    {
        _persistencyService = persistencyService;
        _logger = logger;
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

    public async Task<Trip> CreateTripAsync(Trip trip)
    {
        try
        {
            if (string.IsNullOrEmpty(trip.TripName) || string.IsNullOrWhiteSpace(trip.CreatedBy.ToString()))
            {
                throw new ValidationException("Name or CreatedBy is empty");
            }
            var creator = await _persistencyService.FindByIdAsync<User>(trip.CreatedBy) ?? throw new NotFoundException("Creator not found");
            creator.Trips!.Add(trip.Id);
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
    
    
}