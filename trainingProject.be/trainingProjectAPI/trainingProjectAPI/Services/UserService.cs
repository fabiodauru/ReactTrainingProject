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
                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            message = ServiceMessage.Invalid;
            _logger.LogWarning("Username or Password is empty");
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
                        Token = message == ServiceMessage.Success ? CreateJwtToken(user) : null,
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

    public async Task<UserResponseDto> GetUserByIdAsync(Guid userId)
    {
        var dto = new UserResponseDto
        {
            Id = Guid.Empty,
            Username = string.Empty
        };

        if (userId == Guid.Empty)
        {
            _logger.LogWarning("No user ID provided.");
            return dto;
        }

        try
        {
            var result = await _persistencyService.FindByIdAsync<User>(userId);
            if (result.Found && result.Result != null)
            {
                var u = result.Result;
                dto = new UserResponseDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    ProfilePictureUrl = u.ProfilePictureUrl,
                    Birthday = u.Birthday,
                    UserFirstName = u.UserFirstName,
                    UserLastName = u.UserLastName,
                    Following = u.Following,
                    Followers = u.Followers,
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

        return dto;
    }

    public async Task<UserResponseDto> GetUserByUsernameAsync(string username)
    {
        
        var dto = new UserResponseDto
        {
            Id = Guid.Empty,
            Username = string.Empty
        };

        if (username == String.Empty)
        {
            _logger.LogWarning("No user ID provided.");
            return dto;
        }

        try
        {
            var result = await _persistencyService.FindByField<User>("Username", username);
            if (result.Found && result.Result != null)
            {
                var u = result.Result;
                dto = new UserResponseDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    ProfilePictureUrl = u.ProfilePictureUrl,
                    Birthday = u.Birthday,
                    UserFirstName = u.UserFirstName,
                    UserLastName = u.UserLastName,
                    JoiningDate = u.JoiningDate, 
                    Followers = u.Followers,
                    Following = u.Following,
                };
                _logger.LogInformation("User {UserId} retrieved.", username);
            }
            else
            {
                _logger.LogWarning("User {UserId} not found.", username);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}.", username);
        }

        return dto;
    }

    public async Task<FollowUserResponseDto> FollowUser(Guid userId, Guid followedUserId)
    {
        User user = createEmptyUser();
        User followedUser = createEmptyUser();
        

        FollowUserResponseDto dto = new FollowUserResponseDto()
        {
            Followed = false,
            FollowedUsername = string.Empty,
            FollowedUserId = Guid.Empty,
        };

        if (userId == Guid.Empty) 
        { 
            _logger.LogWarning("No ID of following user provided.");
            dto.Message = "User not found.";
            return dto;
        }  
        
        if (followedUserId == Guid.Empty)
        {
            _logger.LogWarning("No ID followed user provided.");
            dto.Message = "User not found.";
            return dto;
        }

        if (followedUserId == userId)
        {
            _logger.LogWarning("Cannot follow yourself.");
            dto.Message = "Cannot follow yourself";
            return dto;
        }
        

        var userResponse = await _persistencyService.FindByIdAsync<User>(userId);
        if (userResponse.Found && userResponse.Result != null)
        {
            user = userResponse.Result;
            foreach (var following in user.Following)
            {
                if (following == followedUserId)
                {
                    _logger.LogWarning("Already following user {followedUserId}.", followedUserId);
                    dto.Message = "Already following user";
                    return dto;
                }
            }
            user.Following.Add(followedUserId);
        }
        else
        {
            _logger.LogWarning("User {UserId} who wants to follow someone not found.", userId);
        }
        
        var followedUserResponse = await _persistencyService.FindByIdAsync<User>(followedUserId);
        if (followedUserResponse.Found && followedUserResponse.Result != null)
        {
            followedUser = followedUserResponse.Result;
            followedUser.Followers.Add(userId);
        }
        else
        {
            _logger.LogWarning("User you want to follow {UserId} not found.", userId);
        }
        
        var updateUserResult = await _persistencyService.UpdateAsync<User>(userId, user);
        var updateFollowedUserResult = await _persistencyService.UpdateAsync<User>(followedUserId, followedUser);

        if (updateUserResult.Acknowledged && updateFollowedUserResult.Acknowledged)
        {
            dto = new FollowUserResponseDto()
            {
                Followed = true,
                FollowedUserId = updateFollowedUserResult.Result.Id,
                FollowedUsername = updateFollowedUserResult.Result.Username,
                Message = $" You are now following User {updateFollowedUserResult.Result.Username}"
            };
        }
        else if(!updateUserResult.Acknowledged)
        {
            _logger.LogWarning("Following list of User {UserId} could not be updated.", userId);
            dto.Message = "Could not follow user, try again later";
        }
        else if(!updateFollowedUserResult.Acknowledged)
        {
            _logger.LogWarning("Follower list of User {UserId} could not be updated.", userId);
            dto.Message = "Could not follow user, try again later";
        }
        
        return dto;
    }

    public async Task<UnfollowUserResponseDto> UnfollowUser(Guid userId, Guid unfollowUserId)
    {
        User user = createEmptyUser();
        User followedUser = createEmptyUser();
        

        UnfollowUserResponseDto dto = new UnfollowUserResponseDto()
        {
            Unfollowed = false,
            UnfollowedUsername = string.Empty,
            UnfollowedUserId = Guid.Empty,
        };

        if (userId == Guid.Empty) 
        { 
            _logger.LogWarning("No ID of unfollowing user provided.");
            dto.Message = "User not found.";
            return dto;
        }  
        
        if (unfollowUserId == Guid.Empty)
        {
            _logger.LogWarning("No ID unfollowed user provided.");
            dto.Message = "User not found.";
            return dto;
        }

        if (unfollowUserId == userId)
        {
            _logger.LogWarning("Cannot unfollow yourself.");
            dto.Message = "Listen here you little shit, how were you able to follow yourself??";
            return dto;
        }
        

        var userResponse = await _persistencyService.FindByIdAsync<User>(userId);
        if (userResponse.Found && userResponse.Result != null)
        {
            user = userResponse.Result;
            foreach (var following in user.Following)
            {
                if (following != unfollowUserId)
                {
                    _logger.LogWarning("Not following user {unfollowUserId}.", unfollowUserId);
                    dto.Message = "Not following user";
                    return dto;
                }
            }
            user.Following.Remove(unfollowUserId);
        }
        else
        {
            _logger.LogWarning("User {UserId} who wants to unfollow someone not found.", userId);
        }
        
        var followedUserResponse = await _persistencyService.FindByIdAsync<User>(unfollowUserId);
        if (followedUserResponse.Found && followedUserResponse.Result != null)
        {
            followedUser = followedUserResponse.Result;
            followedUser.Followers.Remove(userId);
        }
        else
        {
            _logger.LogWarning("User you want to unfollow {UserId} not found.", userId);
            dto.Message = "User not found.";
        }
        
        var updateUserResult = await _persistencyService.UpdateAsync<User>(userId, user);
        var updateFollowedUserResult = await _persistencyService.UpdateAsync<User>(unfollowUserId, followedUser);

        if (updateUserResult.Acknowledged && updateFollowedUserResult.Acknowledged)
        {
            dto = new UnfollowUserResponseDto()
            {
                Unfollowed = true,
                UnfollowedUserId = updateFollowedUserResult.Result.Id,
                UnfollowedUsername = updateFollowedUserResult.Result.Username,
                Message = $"You have unfollowed user {updateFollowedUserResult.Result.Username}... yay?"
            };
        }
        else if(!updateUserResult.Acknowledged)
        {
            _logger.LogWarning("Following list of User {UserId} could not be updated.", userId);
            dto.Message = "Could not unfollow user, try again later.";
        }
        else if(!updateFollowedUserResult.Acknowledged)
        {
            _logger.LogWarning("Follower list of User {UserId} could not be updated.", userId);
            dto.Message = "Could not unfollow user, try again later.";
        }
        
        return dto;
    }

    private string CreateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("superSecretKey@345IneedMoreBitsPleaseWork"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(1),
            SigningCredentials = creds
        };
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task<bool> ValidateUser(List<User>? users, User user)
    {
        var noExistingUser = users?.FirstOrDefault(u => u.Username == user.Username || u.Email == user.Email) == null;
        var validEmailSyntax = Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
        var validEmailDomain = (await new LookupClient().QueryAsync(user.Email.Split('@').LastOrDefault(), QueryType.MX)).Answers.Any();
        var validateOver13 = user.Birthday <= DateOnly.FromDateTime(DateTime.Now.AddYears(-13));

        bool[] checks = [noExistingUser, validEmailSyntax, validEmailDomain, validateOver13];
        return checks.All(v => v);
    }


    private User createEmptyUser()
    {
        Address emptyAddress = new Address()
        {
            Street = string.Empty,
            City = string.Empty,
            Country = string.Empty,
            ZipCode = string.Empty,
        };
        
        return new User()
        {
            Id = Guid.Empty,
            Username = string.Empty,
            Email = string.Empty,
            ProfilePictureUrl = string.Empty,
            Password = string.Empty,
            UserFirstName = string.Empty,
            UserLastName = string.Empty,
            JoiningDate = DateTime.MinValue,
            Address = emptyAddress,
        };
    }
}
