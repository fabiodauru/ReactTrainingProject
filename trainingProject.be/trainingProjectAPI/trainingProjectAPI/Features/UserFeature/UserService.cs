using AutoMapper;
using Microsoft.AspNetCore.Identity;
using trainingProjectAPI.Infrastructure.PersistencyService;
using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.UserRequestDTOs;
using trainingProjectAPI.Models.Exceptions;

namespace trainingProjectAPI.Features.UserFeature;

public class UserService : IUserService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<UserService> _logger;
    private readonly PasswordHasher<User> _hasher;
    private readonly IMapper _mapper;

    private Guid _sentielId;
    
    public UserService(IPersistencyService persistencyService, ILogger<UserService> logger, PasswordHasher<User> hasher, IMapper mapper)
    {
        _persistencyService = persistencyService;
        _logger = logger;
        _hasher = hasher;
        _mapper = mapper;
    }
    
    public async Task<User> LoginAsync(LoginRequestDto loginDto)
    {
        try
        {
            var response = (await _persistencyService.FindByPropertyAsync<User>("Username", loginDto.Username)).SingleOrDefault();
            if (response == null || _hasher.VerifyHashedPassword(response, response.Password, loginDto.Password) == PasswordVerificationResult.Failed)
            {
                throw new NotFoundException("User not found");
            }
            _logger.LogInformation($"User with username {loginDto.Username} logged in");
            return response;
        }
        catch (Exception ex)
        { 
            _logger.LogError(ex, $"Error login user {loginDto.Username}");
            throw;
        }
    }
    
    public async Task<User> RegisterAsync(RegisterRequestDto userDto)
    {
        try
        {
            var user = _mapper.Map<User>(userDto);
            user.Password = _hasher.HashPassword(user, userDto.Password);
            var existing = await _persistencyService.FindByPropertyAsync<User>("Username", user.Username);
            if (existing.Any())
            {
                throw new ValidationException("Username already exists");
            }
            var response = await _persistencyService.CreateAsync(user);
            _logger.LogInformation($"User {response.Username} registered on {DateTime.Now}");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user: {Username}", userDto.Username);
            throw;
        }
    }
    
    public async Task<User> ReplaceUserAsync(Guid id, ReplaceUserRequestDto userReplaceRequestDto)
    {
        try
        {
            User userToUpdate = await _persistencyService.FindByIdAsync<User>(id) ?? throw new NotFoundException("User not found");
            _mapper.Map(userReplaceRequestDto, userToUpdate);
            User response = await _persistencyService.UpdateAsync(userToUpdate.Id, userToUpdate) ?? throw new ConflictException("Updating user failed");
            _logger.LogInformation($"User {response.Username} updated");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user: {Id}", id);
            throw;
        }
    }
    
    public async Task<User> GetUserByIdAsync(Guid userId)
    {
        try
        {
            var response = await _persistencyService.FindByIdAsync<User>(userId) ??  throw new NotFoundException("User not found");
            _logger.LogInformation($"User {response.Username} found");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}.", userId);
            throw;
        }
    }
    
    public async Task DeleteUserAsync(Guid userId)
    {
        try
        {
            Guid sentielId = await GetSentielIdAsync();
            var trips = await _persistencyService.FindByPropertyAsync<Trip>("CreatedBy", userId) ?? throw new NotFoundException("Trips not found");
            var sentiel = await _persistencyService.FindByIdAsync<User>(sentielId) ?? throw new NotFoundException("Sentiel not found");
            foreach (var trip in trips)
            {
                var responseTrip = await _persistencyService.FindAndUpdateByPropertyAsync<Trip>(trip.Id, "CreatedBy", sentielId) ?? throw new ConflictException("Trip not updated");
                sentiel.Trips.Add(responseTrip.Id);
            }

            var responseUser = await _persistencyService.FindAndUpdateByPropertyAsync<User>(sentielId, "Trips", trips) ?? throw new ConflictException("Sentiel not updated");
            sentiel = responseUser;

            await _persistencyService.DeleteAsync<User>(userId);
            _logger.LogInformation($"User {userId} deleted and trips saved in {sentiel.Username}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}.", userId);
            throw;
        }
    }

    public async Task<User> UpdateUserAsync(Guid userId, string property, object value)
    {
        try
        {
            if (string.IsNullOrEmpty(property))
            {
                throw new ValidationException("Property name is empty");
            }
            if (property == nameof(User.Password))
            {
                var user = await _persistencyService.FindByIdAsync<User>(userId) ?? throw new NotFoundException("User not found");
                value = _hasher.HashPassword(user, property);
            }
            var response = await _persistencyService.FindAndUpdateByPropertyAsync<User>(userId, property, value) ?? throw new ConflictException("User not updated");
            _logger.LogInformation($"User {response.Username} updated");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}.", userId);
            throw;
        }
    }
    
    public async Task<User> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto changePasswordRequestDto)
    {
        try
        {
            var user = await _persistencyService.FindByIdAsync<User>(userId) ?? throw new NotFoundException("User not found");
            if (_hasher.VerifyHashedPassword(user, user.Password, changePasswordRequestDto.OldPassword) == PasswordVerificationResult.Failed)
            {
                throw new ValidationException("Old password is incorrect");
            }
            user.Password = _hasher.HashPassword(user, changePasswordRequestDto.NewPassword);
            var response = await _persistencyService.FindAndUpdateByPropertyAsync<User>(userId, "Password", user.Password) ?? throw new ConflictException("User not updated");
            _logger.LogInformation($"User {response.Username} changed password");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}.", userId);
            throw;
        }
    }

    public async Task<List<GetAllUsersResponseDto>> GetAllUsersAsync()
    {
        try
        {
            var response = await _persistencyService.ReadAsync<User>() ?? throw new NotFoundException("User not found");
            var userDtos = response
                .Select(user => _mapper.Map<GetAllUsersResponseDto>(user))
                .ToList();
            _logger.LogInformation("Got all users");
            return userDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            throw;
        }
    }

    public async Task<User> ManageFollowingAsync(Guid userId, ManageFollowingRequestDto manageFollowingRequestDto)
    {
        try
        {
            var existingFollowing = (await _persistencyService.FindByIdAsync<User>(userId) ??
                                     throw new NotFoundException("User not found")).Following;
            var followingUser =
                (await _persistencyService.FindByPropertyAsync<User>(nameof(User.Username),
                    manageFollowingRequestDto.Username)).SingleOrDefault() ??
                throw new NotFoundException("Following not found");
            if (manageFollowingRequestDto.Following)
            {
                existingFollowing.Add(followingUser.Id);
            }
            else
            {
                existingFollowing.Remove(followingUser.Id);
            }

            var response =
                await _persistencyService.FindAndUpdateByPropertyAsync<User>(userId, nameof(User.Following),
                    existingFollowing) ?? throw new ConflictException("User not updated");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing following for user {UserId}.", userId);
            throw;
        }
    }

    public async Task<User> GetUserByPropertyAsync(string property, object value)
    {
        try
        {
            if (string.IsNullOrEmpty(property))
            {
                throw new ValidationException("Property name is empty");
            }

            var response = (await _persistencyService.FindByPropertyAsync<User>(property, value)).SingleOrDefault() ?? throw new NotFoundException("User not found");

            _logger.LogInformation($"User {response.Username} found");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by {Property}: {Value}",  property, value.ToString());
            throw;
        }
    }
    
    private async Task<Guid> GetSentielIdAsync()
    {
        if (_sentielId != Guid.Empty)
        {
            return _sentielId;
        }
        var sentinel = await CreateSentielIfNotExistsAsync();
        _sentielId = sentinel.Id;
        return _sentielId;
    }
    
    private async Task<User> CreateSentielIfNotExistsAsync()
    {
        try
        {
            var sentiel = (await _persistencyService.FindByPropertyAsync<User>("Username", "Sentiel")).FirstOrDefault();
            if (sentiel != null)
            {
                return sentiel;
            }
            var sentinel = new User
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

            var response = await _persistencyService.CreateAsync(sentinel);
            _logger.LogInformation("Sentiel user created.");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sentiel.");
            throw;
        }
    } 
}