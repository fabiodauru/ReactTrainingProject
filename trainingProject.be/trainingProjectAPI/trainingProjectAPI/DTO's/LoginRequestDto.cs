using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.DTO_s
{
    public class LoginRequestDto<T> where T : IHasId
    {
        public required string Username { get; init; }
        public required string Password { get; init; }
    }
}
