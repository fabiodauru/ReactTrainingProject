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

    public async Task<ServiceResponse<CreateResponseDto>> CreateTripAsync(CreateTripRequestDto? tripRequest)
    {
        if (tripRequest == null || tripRequest.CreatedBy == Guid.Empty)
        {
            _logger.LogWarning("Invalid trip request: null or CreatedBy is empty");
            return new ServiceResponse<CreateResponseDto>
            {
                Message = ServiceMessage.Invalid,
                Result = new CreateResponseDto { Name = tripRequest?.TripName ?? string.Empty }
            };
        }

        try
        {
            var user = await _persistencyService.FindByIdAsync<User>(tripRequest.CreatedBy);
            if (!user.Found || user.Result == null)
            {
                _logger.LogWarning($"User {tripRequest.CreatedBy} not found");
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.NotFound,
                    Result = new CreateResponseDto { Name = tripRequest.TripName }
                };
            }

            var trip = TripMapper(tripRequest);

            var createResponse = await _persistencyService.CreateAsync(trip);
            if (!createResponse.Acknowledged)
            {
                _logger.LogError("Persistency did not acknowledge trip creation");
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Error,
                    Result = new CreateResponseDto { Name = tripRequest.TripName }
                };
            }

            user.Result.Trips ??= new List<Trip>();
            user.Result.Trips.Add(trip);

            var updateUser = await _persistencyService.UpdateAsync(user.Result.Id, user.Result);
            if (!updateUser.Acknowledged)
            {
                _logger.LogError($"Failed to update user {user.Result.Id} with new trip {trip.Id}");
                return new ServiceResponse<CreateResponseDto>
                {
                    Message = ServiceMessage.Error,
                    Result = new CreateResponseDto { Name = tripRequest.TripName }
                };
            }

            _logger.LogInformation($"Trip {trip.TripName} created and added to user {user.Result.Username}");
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
                Result = new CreateResponseDto { Name = tripRequest.TripName }
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

    public async Task<ListResponseDto<TripReponseDto>> GetUserTripsAsync(Guid userId)
    {
        var response = new ListResponseDto<TripReponseDto> { Items = new List<TripReponseDto>() };

        try
        {
            var user = await _persistencyService.FindByIdAsync<User>(userId);
            if (!user.Found || user.Result == null)
            {
                _logger.LogWarning($"User with ID {userId} not found.");
                return response;
            }

            var tripDtos = (user.Result.Trips ?? new List<Trip>())
                .Select(t => new TripReponseDto
                {
                    Trip = t,
                    CreatedByUsername = user.Result.Username,
                    CreatedByProfilePictureUrl = user.Result.ProfilePictureUrl
                })
                .ToList();

            _logger.LogInformation("Successfully retrieved user's trips.");
            return new ListResponseDto<TripReponseDto> { Items = tripDtos };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user's trips.");
            return response;
        }
    }

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
