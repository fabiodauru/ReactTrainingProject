using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class CreateTripResponseDto : IHasId
{
    public Guid Id { get; set; }
    public required string TripName { get; set; }
}