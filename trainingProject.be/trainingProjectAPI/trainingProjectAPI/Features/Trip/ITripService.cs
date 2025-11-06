using trainingProjectAPI.DTOs;
using trainingProjectAPI.DTOs.TripRequestDTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface ITripService
{
    Task<List<Trip>> GetAllTripsAsync();
    Task<Trip> CreateTripAsync(CreateTripRequestDto tripDto, Guid creatorId);
    Task DeleteTripAsync(Guid tripId);
    Task<Trip> GetTripByIdAsync(Guid tripId);
    Task<List<Trip>> GetTripsByPropertyAsync(string property, object value);


}
