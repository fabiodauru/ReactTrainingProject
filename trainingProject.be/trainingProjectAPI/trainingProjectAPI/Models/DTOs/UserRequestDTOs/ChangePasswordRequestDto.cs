using System.ComponentModel.DataAnnotations;

namespace trainingProjectAPI.DTOs
{
    public class ChangePasswordRequestDto
    {
        [Required]
        public required string OldPassword { get; set; }
        [Required(ErrorMessage = "Password is required.")]
        [StringLength(64, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 64 characters.")]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )]
        public required string NewPassword { get; set; }
    }
}
