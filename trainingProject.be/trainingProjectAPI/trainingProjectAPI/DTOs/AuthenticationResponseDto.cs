using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.DTOs
{
    public class AuthenticationResponseDto
    {
        public string? Message { get; set; }
        public string? Token { get; init; }
        public DateTime? Expiration { get; init; }
        public string? Username { get; init; }
    }
}
