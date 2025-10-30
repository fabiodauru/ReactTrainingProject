namespace trainingProjectAPI.Features.AuthentificationFeature;

public interface IAuthService
{
    (bool isValid, string? purpose) Check(string token);
    string CreateJwtToken(Models.Domain.User user, string? purpose = null, TimeSpan? expiration = null);
}