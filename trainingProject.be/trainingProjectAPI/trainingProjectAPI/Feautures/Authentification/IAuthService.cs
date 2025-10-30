using trainingProjectAPI.Models;

namespace trainingProjectAPI.Feautures.Authentification;

public interface IAuthService
{
    (bool isValid, string? purpose) Check(string token);
    string CreateJwtToken(User user, string? purpose = null, TimeSpan? expiration = null);
}