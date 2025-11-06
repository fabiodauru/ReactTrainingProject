using System.ComponentModel.DataAnnotations;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs.TripRequestDTOs;

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

    [Required(ErrorMessage = "Distance is required.")]
    [Range(0.1, double.MaxValue, ErrorMessage = "Distance must be greater than 0.")]
    public required double Distance { get; init; }

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public required string Description { get; init; }

    public TimeSpan? Duration { get; init; }

}