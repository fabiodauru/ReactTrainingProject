using System.ComponentModel.DataAnnotations;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs
{
    public class RegisterRequestDto
    {
        [StringLength(50, MinimumLength = 5, ErrorMessage = "Username must be between 5 and 50 characters.")]
        [Required]
        public required string Username { get; init; }
        [Required(ErrorMessage = "Password is required.")]
        [StringLength(64, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 64 characters.")]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )]
        public required string Password { get; init; }
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [Required]
        public required string Email { get; init; }
        [StringLength(20, ErrorMessage = "First name cannot exceed 20 characters.")]
        [Required]
        public required string UserFirstName { get; init; }
        [StringLength(20, ErrorMessage = "Last name cannot exceed 20 characters.")]
        [Required]
        public required string UserLastName { get; init; }
        public required Address Address { get; init; }
        [DataType(DataType.Date, ErrorMessage = "Invalid date format for birthday.")]
        public DateOnly Birthday { get; init; }
    }
}
