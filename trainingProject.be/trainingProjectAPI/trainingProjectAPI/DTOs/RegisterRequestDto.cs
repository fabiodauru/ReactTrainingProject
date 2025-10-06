using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs
{
    public class RegisterRequestDto : IIsDto
    {
        public required string Username { get; init; }
        public required string Password { get; init; }
        public required string Email { get; init; }
        public required string UserFirstName { get; init; }
        public required string UserLastName { get; init; }
        public required Address Address { get; init; }
        public DateOnly Birthday { get; init; }
    }
}
