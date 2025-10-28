using System.ComponentModel.DataAnnotations;

namespace trainingProjectAPI.DTOs
{
    public class EmailRequestDto
    {
        [Required]
        [StringLength(254, ErrorMessage = "Email must be 254 characters or fewer.")]
        [EmailAddress(ErrorMessage = "Email must be a valid email address.")]
        [RegularExpression(
            @"^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~\-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~\-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$",
            ErrorMessage = "Email must include a valid local part, domain, and TLD.")]
        public required string Email { get; init; }
    }
}
