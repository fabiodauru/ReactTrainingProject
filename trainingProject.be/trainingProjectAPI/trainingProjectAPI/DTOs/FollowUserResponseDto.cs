namespace trainingProjectAPI.DTOs;

public class FollowUserResponseDto
{
    public bool Followed { get; init; }
    public string FollowedUsername { get; init; }
    public Guid FollowedUserId { get; init; }
    public string Message { get; set; }
}