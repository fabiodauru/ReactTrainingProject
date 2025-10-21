using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.DTOs
{
    public class AuthenticationResponseDto
    {
        public string? Message { get; set; } //ToDo Can be deleted
        public string? Token { get; init; }
        public DateTime? Expiration { get; init; }
        public string? Username { get; init; }
    }
}
