using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs
{
    public class TripReponseDto
    {
        public required Trip Trip { get; set; }
        public required string CreatedByUsername { get; set; }
        public string? CreatedByProfilePictureUrl { get; set; }
    }
}
