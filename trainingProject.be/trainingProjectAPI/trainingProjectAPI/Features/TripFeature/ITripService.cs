using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.TripRequestDTOs;

namespace trainingProjectAPI.Features.TripFeature;

public interface ITripService
{
    Task<List<Trip>> GetAllTripsAsync();
    Task<Trip> CreateTripAsync(CreateTripRequestDto tripDto);
    Task DeleteTripAsync(Guid tripId);
    Task<Trip> GetTripByIdAsync(Guid tripId);
    Task<List<Trip>> GetTripsByPropertyAsync(string property, object value);



}
