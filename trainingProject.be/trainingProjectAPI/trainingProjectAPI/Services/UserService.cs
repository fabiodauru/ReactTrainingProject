using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Services;

public class UserService : IUserService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<UserService> _logger;

    public UserService(IPersistencyService persistencyService, ILogger<UserService> logger)
    {
        _persistencyService = persistencyService;
        _logger = logger;
    }

    public async Task<ServiceResponse<User>> CheckLogin(string username, string password)
    {
        var message = ServiceMessage.Invalid;
        User? result = null;
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            try
            {
                var response = await _persistencyService.ReadAsync<User>();
                if (response is { Found: true, Results: not null })
                {
                    var user = response.Results.FirstOrDefault(u => u.Username == username && u.Password == password);
                    if (user != null)
                    {
                        message = ServiceMessage.Success;
                        _logger.LogInformation($"User {username} logged in");
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

        return new ServiceResponse<User>
        {
            Message = message,
            Result = result
        };
    }
    

    public async Task<ServiceResponse<User>> Register(User user)
    {
        var message = ServiceMessage.Invalid;
        User? result = null;
        if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password))
        {
            try
            {
                var readResponse = await _persistencyService.ReadAsync<User>();
                if (readResponse is { Found: true, Results: not null })
                {
                    var existingUser = readResponse.Results.FirstOrDefault(u => u.Username == user.Username && u.Password == user.Password);
                    if (existingUser == null)
                    {
                        var createResponse = await _persistencyService.CreateAsync(user);
                        if (createResponse.Acknowledged)
                        {
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

        return new ServiceResponse<User>
        {
            Message = message,
            Result = result
        };
    }
}