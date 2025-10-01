using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.DTO_s
{
    public class TokenResponseDto<T> where T : IHasId
    {
        public required ServiceMessage Message { get; init; }
        public required T? Result { get; init; }
        public required string Token { get; init; }
        public required DateTime Expiration { get; init; }
        public string Username { get; init; } = string.Empty;
    }
}
