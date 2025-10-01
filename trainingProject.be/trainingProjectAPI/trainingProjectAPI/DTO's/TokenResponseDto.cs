namespace trainingProjectAPI.DTO_s
{
    public class TokenResponseDto
    {
        public required string Token { get; init; }
        public required DateTime Expiration { get; init; }
    }
}
