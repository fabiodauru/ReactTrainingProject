using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface ITripService
{
    Task<List<Trip>> GetAllTripsAsync();
    Task<Trip> CreateTripAsync(Trip trip);
    Task DeleteTripAsync(Guid tripId);
    Task<Trip> GetTripByIdAsync(Guid tripId);

    
}
