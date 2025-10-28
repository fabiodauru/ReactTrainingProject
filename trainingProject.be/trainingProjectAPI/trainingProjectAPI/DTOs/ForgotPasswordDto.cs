using System.ComponentModel.DataAnnotations;

namespace trainingProjectAPI.DTOs
{
    public class ForgotPasswordDto
    {
        [Required]
        public required string Password { get; init; }
    }
}
