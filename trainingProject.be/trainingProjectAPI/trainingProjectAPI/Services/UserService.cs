using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Services;

public class UserService : IUserService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<UserService> _logger;
    private readonly PasswordHasher<User> _hasher = new PasswordHasher<User>();
    

    public UserService(IPersistencyService persistencyService, ILogger<UserService> logger)
    {
        _persistencyService = persistencyService;
        _logger = logger;
    }

    public async Task<TokenResponseDto<User>> CheckLogin(string username, string password)
    {
        var message = ServiceMessage.Invalid;
        User? result = null;
        if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
        {
            try
            {
                var response = await _persistencyService.ReadAsync<User>();
                if (response is { Found: true, Results: not null })
                {
                    var user = response.Results.FirstOrDefault(u => u.Username == username || u.Email == username);
                    if (user != null)
                    {
                        var verificationResult = _hasher.VerifyHashedPassword(user, user.Password, password);
                        if (verificationResult == PasswordVerificationResult.Success)
                        {
                            result = user;
                            message = ServiceMessage.Success;
                            _logger.LogInformation($"User {username} logged in");
                        }
                        else
                        {
                            message = ServiceMessage.Invalid;
                            _logger.LogWarning($"Invalid password for user {username}");
                        }
                    }
                }
                else
                {
                    message = ServiceMessage.NotFound;
                    _logger.LogWarning($"User {username} not found");
                }
            }
            catch (Exception)
            {
                message = ServiceMessage.Error;
                _logger.LogError($"Error by login user: {username}");
            }
        }

        return new TokenResponseDto<User>
        {
            Message = message,
            Result = result,
            Token = result != null ? CreateJwtToken(result) : null,
            Expiration = result != null ? DateTime.Now.AddDays(1) : null,
            Username = username
        };
    }


    public async Task<TokenResponseDto<User>> Register(User user)
    {
        var message = ServiceMessage.Invalid;
        User? result = null;
        if (!string.IsNullOrEmpty(user.Username) && !string.IsNullOrEmpty(user.Password))
        {
            try
            {
                user.Password = HashPassword(user);
                var readResponse = await _persistencyService.ReadAsync<User>();
                if (readResponse is { Found: true, Results: not null })
                {
                    var existingUser = readResponse.Results.FirstOrDefault(u => u.Username == user.Username || u.Email == user.Email);
                    if (existingUser == null)
                    {
                        var createResponse = await _persistencyService.CreateAsync(user);
                        if (createResponse.Acknowledged)
                        {
                            result = createResponse.Result!;
                            message = ServiceMessage.Success;
                            _logger.LogInformation($"User {createResponse.Result!.Username} logged in on {createResponse.CreatedOn}");
                        }
                    }
                    else
                    {
                        message = ServiceMessage.Existing;
                        _logger.LogWarning($"User {user.Username} already exists");
                    }
                }
            }
            catch (Exception)
            {
                message = ServiceMessage.Error;
                _logger.LogError($"Error by login user: {user.Username}");
            }
        }

        return new TokenResponseDto<User>
        {
            Message = message,
            Result = result,
            Token = CreateJwtToken(user),
            Expiration = DateTime.Now.AddDays(1),
            Username = user.Username
        };
    }

    private string CreateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("Id", user.Id.ToString())
        };

        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("superSecretKey@345IneedMoreBitsPleaseWork")); // TODO in appsettings.json auslagern
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(1), // Wie lange der Token gültig ist
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private string HashPassword(User user)
    {
        return _hasher.HashPassword(user, user.Password);
    }
}
