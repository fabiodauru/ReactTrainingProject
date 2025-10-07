using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Utilities
{
    public class CheckToken
    {
        private readonly ILogger<CheckToken> _logger;
        public CheckToken(ILogger<CheckToken> logger)
        {
            _logger = logger;
        }
        
        public bool Check(string token)
        {
            ServiceMessage message;
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

                _logger.LogInformation("Token is valid");
                return true;
            }
            catch
            {
                _logger.LogWarning("Token is invalid");
                return false;
            }
        }
    }
}
