using System.ComponentModel.DataAnnotations;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class CreateTripRequestDto
{
    [Required(ErrorMessage = "Start coordinates are required.")]
    public required Coordinates StartCoordinates { get; init; }

    [Required(ErrorMessage = "End coordinates are required.")]
    public required Coordinates EndCoordinates { get; init; }

    [Required(ErrorMessage = "Trip name is required.")]
    [StringLength(100, ErrorMessage = "Trip name cannot exceed 100 characters.")]
    public required string TripName { get; init; }

    public List<Image>? Images { get; init; }

    public List<Restaurant>? Restaurants { get; init; }

    [Range(0, double.MaxValue, ErrorMessage = "Elevation must be a positive number.")]
    public double? Elevation { get; init; }

    [Required(ErrorMessage = "Distance is required.")]
    [Range(0.1, double.MaxValue, ErrorMessage = "Distance must be greater than 0.")]
    public required double Distance { get; init; }

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public required string Description { get; init; }

    [Required(ErrorMessage = "CreatedBy (user ID) is required.")]
    public required Guid CreatedBy { get; init; }

    [Required(ErrorMessage = "Duration is required.")]
    public required TimeSpan Duration { get; init; }

    [Range(1, 5, ErrorMessage = "Difficulty must be between 1 and 5.")]
    public required int? Difficulty { get; init; }
}