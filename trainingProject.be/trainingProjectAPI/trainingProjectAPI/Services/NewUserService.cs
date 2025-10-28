using Microsoft.AspNetCore.Identity;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.PersistencyService;
using trainingProjectAPI.Repositories;

namespace trainingProjectAPI.Services;

public class NewUserService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<UserService> _logger;
    private readonly PasswordHasher<User> _hasher;
    private readonly NewMongoDbContext _context;

    private Guid _sentielId;
    
    public NewUserService(IPersistencyService persistencyService, NewMongoDbContext context, ILogger<UserService> logger, PasswordHasher<User> hasher, ITripService tripService, TripRepository tripRepository)
    {
        _persistencyService = persistencyService;
        _logger = logger;
        _hasher = hasher;
        _context = context;
    }
    
    public async Task<User> CheckLoginAsync(string username, string password)
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
            var response = await _context.FindByProperty<User>("Username",  username);
            if (response == null || _hasher.VerifyHashedPassword(response, response.Password, password) == PasswordVerificationResult.Failed)
            {
                throw new NotFoundException("User not found");
            }
            _logger.LogInformation($"User with username {username} logged in");
            return response;
        }
        catch (Exception ex)
        { 
            _logger.LogError(ex, $"Error by login user {username}");
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
            var existing = await _context.FindByProperty<User>("Username", user.Username);
            if (existing != null)
            {
                throw new ValidationException("Username already exists");
            }
            var response = await _context.CreateAsync(user);
            _logger.LogInformation($"User {response.Username} registered on {DateTime.Now}");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error by registering user: {Username}", user.Username);
            throw;
        }
    }
    
    public async Task<User> ReplaceUserAsync(Guid id, User newUser)
    {
        try
        {
            var userToUpdate = await _context.FindByIdAsync<User>(id);
            if (userToUpdate != null)
            {
                throw new NotFoundException("User not found");
            }

            foreach (var prop in typeof(User).GetProperties())
            {
                if (prop.Name == nameof(User.Password))
                {
                    newUser.Password = _hasher.HashPassword(newUser, newUser.Password);
                }
            }

            var response = await _context.UpdateAsync(id, newUser);
            if (response == null)
            {
                throw new ConflictException("Updating user failed");
            }
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
            var response = await _context.FindByIdAsync<User>(userId);
            if (response == null)
            {
                throw new NotFoundException("User not found");
            }
            _logger.LogInformation($"User {response.Username} found");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}.", userId);
            throw;
        }
    }
}