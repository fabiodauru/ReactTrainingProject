using System.ComponentModel.DataAnnotations;
using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.DTOs
{
    public class LoginRequestDto
    {
                [StringLength(50, MinimumLength = 5, ErrorMessage = "Username must be between 5 and 50 characters.")]
        public required string Username { get; init; }
        [Required(ErrorMessage = "Password is required.")]
        public required string Password { get; init; }
    }
}
