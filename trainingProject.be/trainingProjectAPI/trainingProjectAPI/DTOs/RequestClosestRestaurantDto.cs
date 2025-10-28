using System.ComponentModel.DataAnnotations;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs
{
    public class RequestClosestRestaurantDto
    {
        [Required(ErrorMessage = "Start coordinates are required.")]
        public required Coordinates StartCoordinates { get; set; }
        [Required(ErrorMessage = "End coordinates are required.")]
        public required Coordinates EndCoordinates { get; set; }
    }
}