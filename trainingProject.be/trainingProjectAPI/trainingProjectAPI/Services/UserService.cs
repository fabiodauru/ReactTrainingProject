using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using DnsClient;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Services;

public class UserService : IUserService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<UserService> _logger;
    private readonly PasswordHasher<User> _hasher;


    public UserService(IPersistencyService persistencyService, ILogger<UserService> logger, PasswordHasher<User> hasher)
    {
        _persistencyService = persistencyService;
        _logger = logger;
        _hasher = hasher;
    }

    public async Task<ServiceResponse<AuthenticationResponseDto>> CheckLoginAsync(string username, string password)
    {
        ServiceMessage message;
        User? userResult = null;
        if (string.IsNullOrEmpty(username) && string.IsNullOrEmpty(password))
        {
            message = ServiceMessage.Invalid;
            _logger.LogWarning($"Username or Password is empty");
        }
        else
        {
            try
            {
                var response = await _persistencyService.ReadAsync<User>();
                if (!response.Found)
                {
                    throw new Exception("Error by getting User");
                }
                var user = response.Results?.FirstOrDefault(u => u.Username == username || u.Email == username);
                if (user != null && _hasher.VerifyHashedPassword(user, user.Password, password) == PasswordVerificationResult.Success)
                {
                    userResult = user;
                    message = ServiceMessage.Success;
                    _logger.LogInformation($"User {username} logged in");
                }
                else
                {
                    message = ServiceMessage.Invalid;
                    _logger.LogWarning($"Invalid password for user {username}");
                }
            }
            catch (Exception ex)
            {
                message = ServiceMessage.Error;
                _logger.LogError(ex, $"Error by login user: {username}");
            }
        }

        var dto = new AuthenticationResponseDto
        {
            Token = userResult != null ? CreateJwtToken(userResult) : null,
            Expiration = userResult != null ? DateTime.Now.AddDays(1) : null,
            Username = username
        };

        return new ServiceResponse<AuthenticationResponseDto>
        {
            Message = message,
            Result = dto
        };
    }


    public async Task<ServiceResponse<AuthenticationResponseDto>> RegisterAsync(User user)
    {
        ServiceMessage message;
        if (string.IsNullOrEmpty(user.Username) && !string.IsNullOrEmpty(user.Password))
        {
            message = ServiceMessage.Invalid;
            _logger.LogWarning($"Username or Password is empty");
        }
        else
        {
            try
            {
                user.Password = _hasher.HashPassword(user, user.Password);
                var readResponse = await _persistencyService.ReadAsync<User>();
                if (!readResponse.Found)
                {
                    throw new Exception("Error by getting users");
                }
                var check = await ValidateUser(readResponse.Results, user);
                if (check)
                {
                    var createResponse = await _persistencyService.CreateAsync(user);
                    if (createResponse.Acknowledged)
                    {
                        message = ServiceMessage.Success;
                        _logger.LogInformation($"User {createResponse.Result!.Username} registered on {createResponse.CreatedOn}");
                    }
                    else
                    {
                        throw new Exception("Error by setting user");
                    }
                }
                else
                {
                    message = ServiceMessage.Existing;
                    _logger.LogWarning($"User {user.Username} already exists");
                }
            }
            catch (Exception ex)
            {
                message = ServiceMessage.Error;
                _logger.LogError(ex, $"Error by login user: {user.Username}");
            }
        }

        var dto = new AuthenticationResponseDto
        {
            Token = CreateJwtToken(user),
            Expiration = DateTime.Now.AddDays(1),
            Username = user.Username
        };
        return new ServiceResponse<AuthenticationResponseDto>
        {
            Message = message,
            Result = dto
        };
    }

    public async Task<ServiceResponse<UpdateResponseDto<User>>> UpdateAsync(Guid id, User newUser)
    {
        var message = ServiceMessage.Invalid;
        var updatedAttributes = new List<string>();
        var name = string.Empty;

        try
        {
            var userToUpdate = await _persistencyService.FindByIdAsync<User>(id);
            if (userToUpdate is not { Found: true, Result: not null })
            {
                _logger.LogWarning($"User with id {id} not found");
                return new ServiceResponse<UpdateResponseDto<User>>
                {
                    Message = ServiceMessage.NotFound,
                    Result = new UpdateResponseDto<User> { Name = name, UpdatedAttributes = updatedAttributes }
                };
            }

            foreach (var prop in typeof(User).GetProperties())
            {
                if (prop.Name is "Id" or "CreatedOn" or "UpdatedOn")
                    continue;

                var attributeOld = prop.GetValue(userToUpdate.Result);
                var attributeNew = prop.GetValue(newUser);

                if (!Equals(attributeOld, attributeNew) && attributeNew != null)
                {
                    if (prop.Name == nameof(User.Password))
                    {
                        newUser.Password = _hasher.HashPassword(newUser, newUser.Password);
                    }
                    updatedAttributes.Add(prop.Name);
                }
            }

            if (updatedAttributes.Count == 0)
            {
                message = ServiceMessage.Success;
                name = userToUpdate.Result.Username;
                _logger.LogInformation($"No changes for user {name}");
            }
            else
            {
                var updateResponse = await _persistencyService.UpdateAsync(id, newUser);
                if (updateResponse.Acknowledged)
                {
                    message = ServiceMessage.Success;
                    name = updateResponse.Result!.Username;
                    _logger.LogInformation($"User {name} updated: {string.Join(", ", updatedAttributes)}");
                }
            }
        }
        catch (Exception ex)
        {
            message = ServiceMessage.Error;
            _logger.LogError(ex, $"Error updating user: {id}");
        }

        return new ServiceResponse<UpdateResponseDto<User>>
        {
            Message = message,
            Result = new UpdateResponseDto<User> { Name = name, UpdatedAttributes = updatedAttributes }
        };
    }


    private string CreateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
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

    private async Task<bool> ValidateUser(List<User>? users, User user)
    {
        var noExistingUser = users?.FirstOrDefault(u => u.Username == user.Username || u.Email == user.Email) == null; //ValidUsernameAndEmail
        var validEmailSyntax = Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase); //ValidEmailSyntax
        var validEmailDomain = (await new LookupClient().QueryAsync(user.Email.Split('@').LastOrDefault(), QueryType.MX)).Answers.Any(); //ValidEmailDomain
        var validateOver13 = user.Birthday <= DateOnly.FromDateTime(DateTime.Now.AddYears(-13)); //Over13Years

        bool[] checks = [noExistingUser, validEmailSyntax, validEmailDomain, validateOver13];
        bool allValid = checks.All(v => v);
        return allValid;

    }
}
