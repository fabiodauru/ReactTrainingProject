using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs
{
    public class RequestClosestRestaurantDto
    {
        public required Coordinates StartCoordinates { get; set; }
        public required Coordinates EndCoordinates { get; set; }
    }
}