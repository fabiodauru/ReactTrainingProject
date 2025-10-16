using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs
{
    public class TripResponseDto
    {
        public required Guid TripId { get; set; }
        public required string TripName { get; set; }
        public required Coordinates StartCoordinates { get; set; }
        public required Coordinates EndCoordinates { get; set; }
        public required string Description { get; set; }
        public string? CreatedByProfilePictureUrl { get; set; }
        public required string CreatedByUsername { get; set; }
        public required double Distance { get; set; }
        public required TimeSpan Duration { get; set; }
        public required int Difficulty { get; set; }
        public required double Elevation { get; set; }
    }
}
