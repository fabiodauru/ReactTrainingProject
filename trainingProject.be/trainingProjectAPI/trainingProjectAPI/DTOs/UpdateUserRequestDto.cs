using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class UpdateUserRequestDto
{
    public string ? Email { get; init; }
    public string? UserFirstName { get; init; }
    public string? UserLastName { get; init; }
    public string? ProfilePictureUrl { get; init; }
    public Address? Address { get; init; }
    public DateOnly? Birthday { get; init; }
}