using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Services
{
    public class AuthService
    {
        private readonly ILogger<AuthService> _logger;
        public AuthService(ILogger<AuthService> logger)
        {
            _logger = logger;
        }
        
        public (bool isValid, string? purpose) Check(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = System.Text.Encoding.UTF8.GetBytes("superSecretKey@345IneedMoreBitsPleaseWork");

            try
            {
                tokenHandler.ValidateToken(token,
                                           new TokenValidationParameters
                                           {
                                               ValidateIssuerSigningKey = true,
                                               IssuerSigningKey = new SymmetricSecurityKey(key),
                                               ValidateIssuer = false,
                                               ValidateAudience = false,
                                               ClockSkew = TimeSpan.Zero
                                           },
                                           out SecurityToken _);
                
                string? purpose = tokenHandler.ReadJwtToken(token).Claims.FirstOrDefault(c => c.Type == "purpose")?.Value;

                _logger.LogInformation("Token is valid. Purpose: {Purpose}", purpose);
                return (true, purpose);
            }
            catch
            {
                _logger.LogWarning("Token is invalid");
                return (false, null);
            }
        }
        
        public string CreateJwtToken(User user, TimeSpan? expiration = null, string? purpose = null)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, user.Username),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            if (!string.IsNullOrEmpty(purpose))
            {
                claims.Add(new Claim("purpose", purpose));
            }

            SymmetricSecurityKey key = new("superSecretKey@345IneedMoreBitsPleaseWork"u8.ToArray());
            SigningCredentials creds = new(key, SecurityAlgorithms.HmacSha256);

            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.Add(expiration ?? TimeSpan.FromDays(1)),
                SigningCredentials = creds
            };
            JwtSecurityTokenHandler tokenHandler = new();
            SecurityToken? token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
