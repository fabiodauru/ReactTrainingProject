using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class CreateTripRequestDto
{
    public required Coordinates StartCoordinates { get; init; }
    public required Coordinates EndCoordinates { get; init; }
    public required string TripName { get; init; }
    public List<Image>? Images { get; init; }
    public List<Restaurant>? Restaurants { get; init; }
    public double? Elevation { get; init; } //TODO: vielleicht noch required machen wenn es geht mit der API
    public required double Distance { get; init; }
    public required string Description { get; init; }
    public required Guid CreatedBy { get; init; }
    public required TimeSpan Duration { get; init; }
    public required int? Difficulty { get; init; }
}