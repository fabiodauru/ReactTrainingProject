using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class CreateTripRequest
{
    public sealed record Trip(
        Coordinates StartCoordinates, 
        Coordinates EndCoordinates, 
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