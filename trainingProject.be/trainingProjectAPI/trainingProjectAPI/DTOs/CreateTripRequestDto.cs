using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class CreateTripRequest
{
    public Coordinates StartCoordinates { get; init; }

    public Coordinates EndCoordinates { get; init; }
    public string TripName { get; init; }
    
    public sealed record Trip(
        , 
        string TripName,
        Guid CreatedBy,
        List<Image> Images,
        List<Restaurant> Restaurants,
        TimeSpan? Duration,
        double? Elevation,
        double? Distance,
        int? Difficulty,
        string? Description
    );
}