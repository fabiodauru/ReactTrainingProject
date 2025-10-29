using System.ComponentModel.DataAnnotations;

namespace trainingProjectAPI.DTOs
{
    public class ForgotPasswordDto
    {
        [Required]
        public string Password { get; init; }
    }
}
