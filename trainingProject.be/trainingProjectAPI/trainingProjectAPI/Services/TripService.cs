using System.Text.RegularExpressions;
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
            Results = trips
        };

        return new ServiceResponse<GetAllResponseDto<Trip>>
        {
            Message = message,
            Result = dto
        };
    }

    public async Task<ServiceResponse<CreateResponseDto>> CreateTripAsync(Trip? trip)
    {
        if (trip == null)
        {
            _logger.LogWarning("Invalid trip request");
            return new ServiceResponse<CreateResponseDto>
            {
                Message = ServiceMessage.Invalid,
                Result = new CreateResponseDto { Name = string.Empty }
            };
        }

        try
        {
            var user = await _persistencyService.FindByIdAsync<User>(trip.CreatedBy);
            if (!user.Found || user.Result == null)
            {
                _logger.LogWarning("User {UserId} not found", trip.CreatedBy);
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.NotFound,
                    Result = new CreateResponseDto { Name = trip.TripName }
                };
            }

            var tripsRead = await _persistencyService.ReadAsync<Trip>();
            if (!tripsRead.Found)
            {
                _logger.LogError("Error loading trips for validation");
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Error,
                    Result = new CreateResponseDto { Name = trip.TripName }
                };
            }

            var isValid = await ValidateTrip(tripsRead.Results, trip);
            if (!isValid)
            {
                _logger.LogWarning("Trip validation failed for {TripName}", trip.TripName);
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Invalid,
                    Result = new CreateResponseDto { Name = trip.TripName }
                };
            }

            var createResponse = await _persistencyService.CreateAsync(trip);
            if (!createResponse.Acknowledged)
            {
                _logger.LogError("Persistency did not acknowledge trip creation");
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Error,
                    Result = new CreateResponseDto { Name = trip.TripName }
                };
            }

            user.Result.Trips ??= [];
            user.Result.Trips.Add(trip.Id);

            var updateUser = await _persistencyService.UpdateAsync(user.Result.Id, user.Result);
            if (!updateUser.Acknowledged)
            {
                _logger.LogError("Failed to update user {UserId} with new trip {TripId}", user.Result.Id, trip.Id);
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Error,
                    Result = new CreateResponseDto { Name = trip.TripName }
                };
            }

            _logger.LogInformation("Trip {TripName} created and added to user {Username}", trip.TripName, user.Result.Username);
            return new ServiceResponse<CreateResponseDto>
            {
                Message = ServiceMessage.Success,
                Result = new CreateResponseDto { Name = trip.TripName }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while creating trip");
            return new ServiceResponse<CreateResponseDto>
            {
                Message = ServiceMessage.Error,
                Result = new CreateResponseDto { Name = trip.TripName }
            };
        }
    }

    public async Task<ServiceResponse<Trip>> DeleteTripAsync(Guid id, Guid userId)
    {
        ServiceMessage message;
        Trip? trip = null;

        try
        {
            var tripToDelete = await _persistencyService.FindByIdAsync<Trip>(id);
            if (tripToDelete is not { Found: true, Result: not null })
            {
                message = ServiceMessage.NotFound;
                _logger.LogWarning($"Trip with id {id} not found");
                return new ServiceResponse<Trip>
                {
                    Message = message,
                    Result = trip
                };
            }

            var tripEntity = tripToDelete.Result;

            if (tripEntity.CreatedBy != userId)
            {
                message = ServiceMessage.Invalid;
                _logger.LogWarning($"User {userId} not authorized to delete trip {id}");
                return new ServiceResponse<Trip>
                {
                    Message = message,
                    Result = null
                };
            }

            var deleteResponse = await _persistencyService.DeleteAsync<Trip>(id);
            if (deleteResponse.Acknowledged)
            {
                message = ServiceMessage.Success;
                trip = tripEntity;
                _logger.LogInformation($"Trip {trip.TripName} deleted on {deleteResponse.DeletedOn}");
            }
            else
            {
                throw new Exception("Error while deleting trip");
            }

            var user = await _persistencyService.FindByIdAsync<User>(userId);
            if (user.Found && user.Result != null)
            {
                user.Result.Trips?.RemoveAll(t => t == id);
                var updateUser = await _persistencyService.UpdateAsync(user.Result.Id, user.Result);
                if (updateUser.Acknowledged)
                {
                    _logger.LogInformation($"Trip {trip.TripName} removed from user {user.Result.Username}");
                }
                else
                {
                    _logger.LogError($"Failed to update user {user.Result.Id} after deleting trip {trip.Id}");
                }
            }
            else
            {
                _logger.LogWarning($"User {userId} not found while trying to update trips after deleting trip {id}");
            }
        }
        catch (Exception ex)
        {
            message = ServiceMessage.Error;
            _logger.LogError(ex, $"Error while deleting trip with id: {id}");
        }

        return new ServiceResponse<Trip>
        {
            Message = message,
            Result = trip
        };
    }

    public async Task<ListResponseDto<Image>> GetTripImagesAsync(Guid tripId)
    {
        var response = new ListResponseDto<Image> { Items = new List<Image>() };

        var trip = await _persistencyService.FindByIdAsync<Trip>(tripId);
        if (!trip.Found || trip.Result == null)
        {
            _logger.LogWarning("Trip with ID {TripId} not found.", tripId);
            return response;
        }

        if (trip.Result.Images != null && trip.Result.Images.Any())
        {
            response = new ListResponseDto<Image> { Items = trip.Result.Images.ToList() };
            _logger.LogInformation("Retrieved {Count} images for trip ID {TripId}.", response.Items.Count, tripId);
        }
        else
        {
            _logger.LogInformation("No images found for trip ID {TripId}.", tripId);
        }

        return response;
    }

    public async Task<ListResponseDto<TripResponseDto>> GetUserTripsAsync(Guid userId)
    {
        var response = new ListResponseDto<TripResponseDto> { Items = new List<TripResponseDto>() };

        try
        {
            var user = await _persistencyService.FindByIdAsync<User>(userId);
            if (!user.Found || user.Result == null)
            {
                _logger.LogWarning($"User with ID {userId} not found.");
                return response;
            }

            if (user.Result.Trips != null)
            {
                var tripTasks = user.Result.Trips.Select(id => _persistencyService.FindByIdAsync<Trip>(id));
                var tripResults = await Task.WhenAll(tripTasks);

                var tripDtos = tripResults
                    .Where(r => r.Found && r.Result != null)
                    .Select(r => new TripResponseDto
                    {
                        TripId = r.Result!.Id,
                        TripName = r.Result.TripName,
                        StartCoordinates = r.Result.StartCoordinates,
                        EndCoordinates = r.Result.EndCoordinates,
                        Description = r.Result.Description ?? "",
                        CreatedByUsername = user.Result.Username,
                        CreatedByProfilePictureUrl = user.Result.ProfilePictureUrl,
                        Distance = r.Result.Distance,
                        Duration = r.Result.Duration ?? TimeSpan.Zero,
                        Difficulty = r.Result.Difficulty ?? 1,
                        Elevation = r.Result.Elevation ?? 0
                    })
                    .ToList();

                _logger.LogInformation("Retrieved {Count} trips for user {UserId}", tripDtos.Count, userId);
                return new ListResponseDto<TripResponseDto> { Items = tripDtos };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user's trips.");
            return response;
        }
        _logger.LogInformation("User {UserId} has no trips.", userId);
        return response;
    }

    private Task<bool> ValidateTrip(List<Trip>? trips, Trip trip)
    {
        var noExistingTrip = trips?.FirstOrDefault(t => t.TripName == trip.TripName && t.CreatedBy == trip.CreatedBy) == null;
        var hasCreator = trip.CreatedBy != Guid.Empty;
        var hasNameSyntax = Regex.IsMatch(trip.TripName, @"^[\w\s\-]{3,100}$", RegexOptions.CultureInvariant);
        var hasPositiveDistance = trip.Distance > 0;
        var validDuration = !trip.Duration.HasValue || trip.Duration.Value > TimeSpan.Zero;
        var validDifficulty = !trip.Difficulty.HasValue || (trip.Difficulty.Value >= 1 && trip.Difficulty.Value <= 5);
        bool[] checks = [noExistingTrip, hasCreator, hasNameSyntax, hasPositiveDistance, validDuration, validDifficulty];
        return Task.FromResult(checks.All(v => v));
    }
}
