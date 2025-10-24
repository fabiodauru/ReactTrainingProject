using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using DnsClient;
using MongoDB.Driver;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;
using trainingProjectAPI.Models.ResultObjects;
using trainingProjectAPI.Repositories;
using DeleteResult = trainingProjectAPI.Models.ResultObjects.DeleteResult;

namespace trainingProjectAPI.Services;

public class UserService : IUserService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ITripService _tripService;
    private readonly ILogger<UserService> _logger;
    private readonly PasswordHasher<User> _hasher;
    private readonly TripRepository _tripRepository;

    private Guid _sentielId;

    public UserService(IPersistencyService persistencyService, ILogger<UserService> logger, PasswordHasher<User> hasher, ITripService tripService, TripRepository tripRepository)
    {
        _persistencyService = persistencyService;
        _logger = logger;
        _hasher = hasher;
        _tripService = tripService;
        _tripRepository = tripRepository;
    }

    public async Task<ServiceResponse<AuthenticationResponseDto>> CheckLoginAsync(string username, string password)
    {
        ServiceMessage message;
        User? userResult = null;
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            message = ServiceMessage.Invalid;
            _logger.LogWarning("Username or Password is empty");
        }

        if (username == "Sentiel")
        {
            message = ServiceMessage.Invalid;
            _logger.LogWarning("Attempt to login as Sentiel user");
        }
        else
        {
            try
            {
                var response = await _persistencyService.ReadAsync<User>();
                if (!response.Found)
                    throw new Exception("Error by getting User");

                var user = response.Results?.FirstOrDefault(u => u.Username == username || u.Email == username);
                if (user != null && _hasher.VerifyHashedPassword(user, user.Password, password) == PasswordVerificationResult.Success)
                {
                    userResult = user;
                    message = ServiceMessage.Success;
                    _logger.LogInformation("User {Username} logged in", username);
                }
                else
                {
                    message = ServiceMessage.Invalid;
                    _logger.LogWarning("Invalid password for user {Username}", username);
                }
            }
            catch (Exception ex)
            {
                message = ServiceMessage.Error;
                _logger.LogError(ex, "Error by login user: {Username}", username);
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
        if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password))
        {
            message = ServiceMessage.Invalid;
            _logger.LogWarning("Username or Password is empty");
        }
        else
        {
            try
            {
                user.Password = _hasher.HashPassword(user, user.Password);
                var readResponse = await _persistencyService.ReadAsync<User>();
                if (!readResponse.Found)
                    throw new Exception("Error by getting users");

                var check = await ValidateUser(readResponse.Results, user);
                if (check)
                {
                    var createResponse = await _persistencyService.CreateAsync(user);
                    if (createResponse.Acknowledged)
                    {
                        message = ServiceMessage.Success;
                        _logger.LogInformation("User {Username} registered on {CreatedOn}", createResponse.Result!.Username, createResponse.CreatedOn);
                    }
                    else
                    {
                        throw new Exception("Error by setting user");
                    }
                }
                else
                {
                    message = ServiceMessage.Existing;
                    _logger.LogWarning("User {Username} already exists", user.Username);
                }
            }
            catch (Exception ex)
            {
                message = ServiceMessage.Error;
                _logger.LogError(ex, "Error by registering user: {Username}", user.Username);
            }
        }

        var dto = new AuthenticationResponseDto
        {
            Expiration = message == ServiceMessage.Success ? DateTime.Now.AddDays(1) : null,
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
                _logger.LogWarning("User with id {Id} not found", id);
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

                if (!Equals(attributeOld, attributeNew) && attributeNew != null) //TODO: dieser Equals check funktioniert nicht für komplexe Typen wie Address oder Listen
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
                _logger.LogInformation("No changes for user {Name}", name);
            }
            else
            {
                var updateResponse = await _persistencyService.UpdateAsync(id, newUser);
                if (updateResponse.Acknowledged)
                {
                    message = ServiceMessage.Success;
                    name = updateResponse.Result!.Username;
                    _logger.LogInformation("User {Name} updated: {Attrs}", name, string.Join(", ", updatedAttributes));
                }
            }
        }
        catch (Exception ex)
        {
            message = ServiceMessage.Error;
            _logger.LogError(ex, "Error updating user: {Id}", id);
        }

        return new ServiceResponse<UpdateResponseDto<User>>
        {
            Message = message,
            Result = new UpdateResponseDto<User> { Name = name, UpdatedAttributes = updatedAttributes }
        };
    }

    public async Task<User> GetUserByIdAsync(Guid userId)
    {
        var user = new User
        {
            Id = Guid.Empty,
            Username = string.Empty,
            Password = string.Empty,
            Email = string.Empty,
            ProfilePictureUrl = null,
            Birthday = DateOnly.MinValue,
            UserFirstName = string.Empty,
            UserLastName = string.Empty,
            Address = new Address
            {
                Street = string.Empty,
                City = string.Empty,
                ZipCode = string.Empty,
                Country = string.Empty
            }
        };

        if (userId == Guid.Empty)
        {
            _logger.LogWarning("No user ID provided.");
            return user;
        }

        try
        {
            var result = await _persistencyService.FindByIdAsync<User>(userId);
            if (result.Found && result.Result != null)
            {
                var u = result.Result;
                user = new User
                {
                    Id = u.Id,
                    Password = u.Password,
                    Username = u.Username,
                    Email = u.Email,
                    ProfilePictureUrl = u.ProfilePictureUrl,
                    Birthday = u.Birthday,
                    UserFirstName = u.UserFirstName,
                    UserLastName = u.UserLastName,
                    JoiningDate = u.JoiningDate,
                    Address = u.Address
                };
                _logger.LogInformation("User {UserId} retrieved.", userId);
            }
            else
            {
                _logger.LogWarning("User {UserId} not found.", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}.", userId);
        }

        return user;
    }
    
    private async Task<Guid> GetSentielIdAsync()
    {
        if (_sentielId != Guid.Empty)
            return _sentielId;

        var sentinel = await CreateSentielIfNotExistsAsync();
        _sentielId = sentinel.Id;
        return _sentielId;
    }
    
    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        try
        {
            var sentielId = await GetSentielIdAsync();
            
            var updateResult = await _tripRepository.UpdateTripsOwnerAsync(userId, sentielId);
            if (!updateResult.Acknowledged)
            {
                _logger.LogWarning("Could not update trips for user {UserId} before deletion.", userId);
                return false;
            }
            
            var trips = await _tripRepository.GetTripsByCreatorIdAsync(_sentielId);
            var sentinelResult = await _persistencyService.FindByIdAsync<User>(_sentielId);
            if (sentinelResult is { Found: true, Result: not null })
            {
                sentinelResult.Result.Trips?.AddRange(trips.Select(t => t.Id));
                await _persistencyService.UpdateAsync(_sentielId, sentinelResult.Result);
            }

            try
            {
                DeleteResult deleteResponse = await _persistencyService.DeleteAsync<User>(userId);
                if (deleteResponse.Acknowledged)
                {
                    _logger.LogInformation("User {UserId} deleted.", userId);
                    return true;
                }

                _logger.LogWarning("User {UserId} could not be deleted. Rolling back trip ownership...", userId);
            }
            catch (Exception)
            {
                _logger.LogError("Error deleting user {UserId}. Rolling back trip ownership...", userId);
            }

            var rollback = await _tripRepository.UpdateTripsOwnerAsync(_sentielId, userId);
            if (!rollback.Acknowledged)
            {
                _logger.LogError("Rollback failed for trips of user {UserId}.", userId);
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}.", userId);
            return false;
        }
    }

    public async Task<User> CreateSentielIfNotExistsAsync()
    {
        var collection = await _persistencyService.ReadAsync<User>();
        User? sentiel = collection.Results?.FirstOrDefault(u => u.Username == "Sentiel");

        if (sentiel == null)
        {
            User sentinel = new User
            {
                Id = Guid.NewGuid(),
                Username = "Sentiel",
                Email = "sentinel@system.local",
                Password = "sentiel",
                UserFirstName = "Sentiel",
                UserLastName = "Sentiel",
                Birthday = DateOnly.FromDateTime(DateTime.Now.AddYears(-1)),
                Address = new Address
                {
                    Street = "Sentiel Street",
                    City = "Sentiel City",
                    ZipCode = "00000",
                    Country = "Sentiel Country"
                }
            };
            _sentielId = sentinel.Id;
            sentinel.Password = _hasher.HashPassword(sentinel, sentinel.Password);
            
            var createResponse = await _persistencyService.CreateAsync(sentinel);
            if (createResponse.Acknowledged)
            {
                _logger.LogInformation("Sentiel user created.");
                return createResponse.Result!;
            }
            _logger.LogError("Error creating Sentiel user.");
            throw new Exception("Error creating Sentiel user.");
        }
        _sentielId = sentiel.Id;
        _logger.LogInformation("Sentiel user already exists.");
        return sentiel;
    }
        

    public async Task<bool> UpdatePasswordAsync(Guid userId, string oldPassword, string newPassword)
    {
        try
        {
            var userResult = await _persistencyService.FindByIdAsync<User>(userId);
            if (!userResult.Found || userResult.Result == null)
            {
                _logger.LogWarning("User {UserId} not found for password update.", userId);
                return false;
            }

            User? user = userResult.Result;
            PasswordVerificationResult verificationResult = _hasher.VerifyHashedPassword(user, userResult.Result.Password, oldPassword);
            if (verificationResult != PasswordVerificationResult.Success)
            {
                _logger.LogWarning("Old password for user {UserId} is incorrect.", userId);
                return false;
            }
            user.Password = _hasher.HashPassword(user, newPassword);

            var updateResponse = await _persistencyService.UpdateAsync(userId, user);
            if (updateResponse.Acknowledged)
            {
                _logger.LogInformation("Password for user {UserId} updated.", userId);
                return true;
            }
            else
            {
                _logger.LogWarning("Password for user {UserId} could not be updated.", userId);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating password for user {UserId}.", userId);
            return false;
        }
    }

    private string CreateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        SymmetricSecurityKey key = new("superSecretKey@345IneedMoreBitsPleaseWork"u8.ToArray());
        SigningCredentials creds = new(key, SecurityAlgorithms.HmacSha256);

        SecurityTokenDescriptor tokenDescriptor = new()
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(1),
            SigningCredentials = creds
        };
        JwtSecurityTokenHandler tokenHandler = new();
        SecurityToken? token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task<bool> ValidateUser(List<User>? users, User user)
    {
        bool noExistingUser = users?.FirstOrDefault(u => u.Username == user.Username || u.Email == user.Email) == null;
        bool validEmailSyntax = Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
        bool validEmailDomain = (await new LookupClient().QueryAsync(user.Email.Split('@').LastOrDefault(), QueryType.MX)).Answers.Any();
        bool validateOver13 = user.Birthday <= DateOnly.FromDateTime(DateTime.Now.AddYears(-13));

        bool[] checks = [noExistingUser, validEmailSyntax, validEmailDomain, validateOver13];
        return checks.All(v => v);
    }
}
