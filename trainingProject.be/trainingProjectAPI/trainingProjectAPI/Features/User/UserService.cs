using AutoMapper;
using Microsoft.AspNetCore.Identity;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Services;

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
            User? response = (await _persistencyService.FindByPropertyAsync<User>("Username", loginDto.Username))?.SingleOrDefault();
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
            User user = _mapper.Map<User>(userDto);
            user.Password = _hasher.HashPassword(user, userDto.Password);
            var existing = await _persistencyService.FindByPropertyAsync<User>("Username", user.Username) ?? throw new ConflictException("Error checking existing usernames");
            if (existing.Any())
            {
                throw new ValidationException("Username already exists");
            }
            User response = await _persistencyService.CreateAsync(user);
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
            User newUser = _mapper.Map<User>(userReplaceRequestDto);
            var userToUpdate = await _persistencyService.FindByIdAsync<User>(id) ?? throw new NotFoundException("User not found");
            var response = await _persistencyService.UpdateAsync(userToUpdate.Id, newUser) ?? throw new ConflictException("Updating user failed");
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
            User response = await _persistencyService.FindByIdAsync<User>(userId) ??  throw new NotFoundException("User not found");
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
            User sentiel = await _persistencyService.FindByIdAsync<User>(sentielId) ?? throw new NotFoundException("Sentiel not found");
            foreach (Trip trip in trips)
            {
                Trip responseTrip = await _persistencyService.FindAndUpdateByPropertyAsync<Trip>(trip.Id, "CreatedBy", sentielId) ?? throw new ConflictException("Trip not updated");
                sentiel.Trips.Add(responseTrip.Id);
            }

            User responseUser = await _persistencyService.FindAndUpdateByPropertyAsync<User>(sentielId, "Trips", trips) ?? throw new ConflictException("Sentiel not updated");
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
                User user = await _persistencyService.FindByIdAsync<User>(userId) ?? throw new NotFoundException("User not found");
                value = _hasher.HashPassword(user, property);
            }
            User response = await _persistencyService.FindAndUpdateByPropertyAsync<User>(userId, property, value) ?? throw new NotFoundException("User not found");
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
            User user = await _persistencyService.FindByIdAsync<User>(userId) ?? throw new NotFoundException("User not found");
            if (_hasher.VerifyHashedPassword(user, user.Password, changePasswordRequestDto.OldPassword) == PasswordVerificationResult.Failed)
            {
                throw new ValidationException("Old password is incorrect");
            }
            user.Password = _hasher.HashPassword(user, changePasswordRequestDto.NewPassword);
            User response = await _persistencyService.FindAndUpdateByPropertyAsync<User>(userId, "Password", user.Password) ?? throw new NotFoundException("User not found");
            _logger.LogInformation($"User {response.Username} changed password");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}.", userId);
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

            User? response = (await _persistencyService.FindByPropertyAsync<User>(property, value) ?? throw new NotFoundException("User not found")).SingleOrDefault();
            if (response == null)
            {
                throw new NotFoundException("User not found");
            }

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
        User sentinel = await CreateSentielIfNotExistsAsync();
        _sentielId = sentinel.Id;
        return _sentielId;
    }
    
    public async Task<User> CreateSentielIfNotExistsAsync()
    {
        try
        {
            User? sentiel = (await _persistencyService.FindByPropertyAsync<User>("Username", "Sentiel"))!.FirstOrDefault();
            if (sentiel != null)
            {
                return sentiel;
            }
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

            User response = await _persistencyService.CreateAsync(sentinel);
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