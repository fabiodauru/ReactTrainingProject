using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class CreateTripResponseDto : IIsDto
{
    public required string TripName { get; init; }
}