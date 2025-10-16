using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface ITripService
{
    Task<ServiceResponse<GetAllResponseDto<Trip>>> GetAllTrips();

    Task<ServiceResponse<CreateResponseDto>> CreateTripAsync(Trip? trip);

    Task<ListResponseDto<Image>> GetTripImagesAsync(Guid tripId);

    Task<ServiceResponse<Trip>> DeleteTripAsync(Guid tripId, Guid userGuid);

    Task<ListResponseDto<TripReponseDto>> GetUserTripsAsync(Guid userId);
}
