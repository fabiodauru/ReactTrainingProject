using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.TripRequestDTOs;

namespace trainingProjectAPI.Features.TripFeature;

public interface ITripService
{
    Task<List<Models.Domain.Trip>> GetAllTripsAsync();
    Task<Models.Domain.Trip> CreateTripAsync(Guid creatorId, CreateTripRequestDto tripDto);
    Task DeleteTripAsync(Guid tripId);
    Task<Models.Domain.Trip> GetTripByIdAsync(Guid tripId);
    Task<List<Models.Domain.Trip>> GetTripsByPropertyAsync(string property, object value);
    Task<User> BookmarkTrip(Guid userId, ManageBookmarkTripDto manageBookmarkTripDto);
}
