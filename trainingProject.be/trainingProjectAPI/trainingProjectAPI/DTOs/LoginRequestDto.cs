using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.DTOs
{
    public class LoginRequestDto : IIsDto
    {
        public required string Username { get; init; }
        public required string Password { get; init; }
    }
}
