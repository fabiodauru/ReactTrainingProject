using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class CreateTripRequestDto
{
    public required Coordinates StartCoordinates { get; init; }
    public required Coordinates EndCoordinates { get; init; }
    public required string TripName { get; init; }
    public required Guid CreatedBy { get; init; }
    public List<Image>? Images { get; init; }
    public List<Restaurant>? Restaurants { get; init; }
    public TimeSpan? Duration { get; init; }
    public double? Elevation { get; init; }
    public double? Distance { get; init; }
    public int? Difficulty { get; init; }
    public string? Description { get; init; }
}