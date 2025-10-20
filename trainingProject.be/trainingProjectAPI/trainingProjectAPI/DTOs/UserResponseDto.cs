using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs
{
    public class UserResponseDto
    {
        public required Guid Id { get; init; }
        public string ? Email { get; init; }
        public required string Username { get; init; }
        public string? UserFirstName { get; init; }
        public string? UserLastName { get; init; }
        public string? ProfilePictureUrl { get; init; }
        public DateTime? JoiningDate { get; init; }
        public Address? Address { get; init; }
        public DateOnly? Birthday { get; init; }
    }
}
