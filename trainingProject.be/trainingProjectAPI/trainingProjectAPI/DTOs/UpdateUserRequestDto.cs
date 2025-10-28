using System.ComponentModel.DataAnnotations;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class UpdateUserRequestDto
{
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    public string ? Email { get; init; }
    [StringLength(20, ErrorMessage = "First name cannot exceed 20 characters.")]
    public string? UserFirstName { get; init; }
    [StringLength(20, ErrorMessage = "Last name cannot exceed 20 characters.")]
    public string? UserLastName { get; init; }
    public string? ProfilePictureUrl { get; init; }
    public Address? Address { get; init; }
    [DataType(DataType.Date, ErrorMessage = "Invalid date format for birthday.")]
    public DateOnly? Birthday { get; init; }
}