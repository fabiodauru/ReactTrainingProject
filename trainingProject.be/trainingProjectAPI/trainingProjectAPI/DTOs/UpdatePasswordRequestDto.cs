namespace trainingProjectAPI.DTOs
{
    public class UpdatePasswordRequestDto
    {
        public string OldPassword { get; set; } = String.Empty;
        public string NewPassword { get; set; } = String.Empty;
    }
}
