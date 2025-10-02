using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.DTOs
{
    public class LoginRequestDto<T> where T : IHasId
    {
        public required string Username { get; init; }
        public required string Password { get; init; }
    }
}
