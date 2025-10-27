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
            if (_hasher.VerifyHashedPassword(response, response.Password, password) == PasswordVerificationResult.Success)
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
}