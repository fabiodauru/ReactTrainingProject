using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class GetAllTripsResponseDto: IIsDto
{
    public required List<Trip>? Trips  { get; init; }
}