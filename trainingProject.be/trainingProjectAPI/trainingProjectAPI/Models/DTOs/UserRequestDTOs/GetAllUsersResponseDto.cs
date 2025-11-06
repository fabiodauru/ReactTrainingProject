namespace trainingProjectAPI.Models.DTOs.UserRequestDTOs;

public class GetAllUsersResponseDto
{
    public required string Username { get; set; }
    public string? ProfilePictureUrl { get; set; }
}