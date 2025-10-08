using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface ITripService
{
    public Task<ServiceResponse<GetAllResponseDto<Trip>>> GetAllTrips();
    public Task<ServiceResponse<CreateResponseDto>> CreateTripAsync(Trip trip);
}