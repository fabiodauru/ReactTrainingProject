using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.DTOs
{
    public class AuthenticationResponseDto
    {
        public string? Token { get; init; }
        public DateTime? Expiration { get; init; }
        public string? Username { get; init; }
    }
}
