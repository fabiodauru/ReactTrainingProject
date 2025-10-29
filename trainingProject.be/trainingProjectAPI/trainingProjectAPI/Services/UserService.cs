using Microsoft.AspNetCore.Identity;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.PersistencyService;
using trainingProjectAPI.Repositories;

namespace trainingProjectAPI.Services;

public class UserService : IUserService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<UserService> _logger;
    private readonly PasswordHasher<User> _hasher;

    private Guid _sentielId;
    
    public UserService(IPersistencyService persistencyService, ILogger<UserService> logger, PasswordHasher<User> hasher)
    {
        _persistencyService = persistencyService;
        _logger = logger;
        _hasher = hasher;
    }
    
    public async Task<User> LoginAsync(string username, string password)
    {
        try
        { 
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            { 
                throw new ValidationException("Username or Password is empty");
            }
            if (username == "Sentiel")
            {
                throw new ValidationException("Attempt to login as Sentiel");
            }

            var response = (await _persistencyService.FindByPropertyAsync<User>("Username", username))?.SingleOrDefault();
            if (response == null || _hasher.VerifyHashedPassword(response, response.Password, password) == PasswordVerificationResult.Failed)
            {
                throw new NotFoundException("User not found");
            }
            _logger.LogInformation($"User with username {username} logged in");
            return response;
        }
        catch (Exception ex)
        { 
            _logger.LogError(ex, $"Error login user {username}");
            throw;
        }
    }
    
    public async Task<User> RegisterAsync(User user)
    {
        try
        {
            if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password))
            { 
                throw new ValidationException("Username or Password is empty");
            }
            if (user.Username == "Sentiel")
            { 
                throw new ValidationException("Attempt to register as Sentiel");
            }
            user.Password = _hasher.HashPassword(user, user.Password);
            var existing = await _persistencyService.FindByPropertyAsync<User>("Username", user.Username);
            if (existing != null)
            {
                throw new ValidationException("Username already exists");
            }
            var response = await _persistencyService.CreateAsync(user);
            _logger.LogInformation($"User {response.Username} registered on {DateTime.Now}");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user: {Username}", user.Username);
            throw;
        }
    }
    
    public async Task<User> ReplaceUserAsync(Guid id, User newUser)
    {
        try
        {
            var userToUpdate = await _persistencyService.FindByIdAsync<User>(id) ?? throw new NotFoundException("User not found");
            foreach (var prop in typeof(User).GetProperties())
            {
                if (prop.Name == nameof(User.Password))
                {
                    newUser.Password = _hasher.HashPassword(newUser, newUser.Password);
                }
            }
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
            var sentielId = await GetSentielIdAsync();
            var trips = await _persistencyService.FindByPropertyAsync<Trip>("CreatedBy", userId) ?? throw new NotFoundException("Trips not found");
            var sentiel = await _persistencyService.FindByIdAsync<User>(sentielId) ?? throw new NotFoundException("Sentiel not found");
            foreach (var trip in trips)
            {
                var responseTrip = await _persistencyService.FindAndUpdateByPropertyAsync<Trip>(trip.Id, "CreatedBy", sentielId) ?? throw new ConflictException("Trip not updated");
                sentiel.Trips!.Add(responseTrip.Id);
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
            var response = await _persistencyService.FindAndUpdateByPropertyAsync<User>(userId, property, value) ?? throw new NotFoundException("User not found");
            _logger.LogInformation($"User {response.Username} updated");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}.", userId);
            throw;
        }
    }

    public async Task<User> GetUserByProperty(string property, object value)
    {
        try
        {
            if (string.IsNullOrEmpty(property))
            {
                throw new ValidationException("Property name is empty");
            }

            var response = (await _persistencyService.FindByPropertyAsync<User>(property, value) ?? throw new NotFoundException("User not found")).SingleOrDefault();
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
        var sentinel = await CreateSentielIfNotExistsAsync();
        _sentielId = sentinel.Id;
        return _sentielId;
    }
    
    public async Task<User> CreateSentielIfNotExistsAsync()
    {
        try
        {
            var sentiel = (await _persistencyService.FindByPropertyAsync<User>("Username", "Sentiel"))!.FirstOrDefault();
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