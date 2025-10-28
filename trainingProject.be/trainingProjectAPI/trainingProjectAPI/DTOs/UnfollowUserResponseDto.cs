namespace trainingProjectAPI.DTOs;

public class UnfollowUserResponseDto
{
    public bool Unfollowed { get; init; }
    public string UnfollowedUsername { get; init; }
    public Guid UnfollowedUserId { get; init; }
    public string Message { get; set; }
}