using System.ComponentModel.DataAnnotations;

namespace trainingProjectAPI.DTOs
{
    public class UpdatePasswordRequestDto
    {
        [Required(ErrorMessage = "Old password is required.")]
        [StringLength(64, MinimumLength = 8, ErrorMessage = "Old password must be between 8 and 64 characters.")]
        public string OldPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "New password is required.")]
        [StringLength(64, MinimumLength = 8, ErrorMessage = "New password must be between 8 and 64 characters.")]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )]
        public string NewPassword { get; set; } = string.Empty;
    }

}
