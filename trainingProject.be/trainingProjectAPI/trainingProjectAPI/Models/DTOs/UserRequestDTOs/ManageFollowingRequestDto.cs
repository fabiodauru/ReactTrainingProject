using System.ComponentModel.DataAnnotations;

namespace trainingProjectAPI.Models.DTOs.UserRequestDTOs;

public class ManageFollowingRequestDto
{
    [StringLength(50, MinimumLength = 5, ErrorMessage = "Username must be between 5 and 50 characters.")]
    [Required]
    [RegularExpression("^(?!Sentiel$).*", ErrorMessage = "The username 'Sentiel' is not allowed.")]
    public required string Username { get; set; }
    [Required]
    public bool Following { get; set; }
}