using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface ITripService
{
    public Task<ServiceResponse<CreateTripResponseDto>> CreateTripAsync(Trip trip);
}