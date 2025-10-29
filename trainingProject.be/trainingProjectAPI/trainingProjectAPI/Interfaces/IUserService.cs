using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<User> LoginAsync(string username, string password);
    Task<User> RegisterAsync(User user);
    Task<User> ReplaceUserAsync(Guid id, User newUser);
    Task<User> GetUserByIdAsync(Guid userId);
    Task DeleteUserAsync(Guid userId);
    Task<User> UpdateUserAsync(Guid userId, string property, object value);
    Task<User> GetUserByProperty(string property, object value);
    Task<User> CreateSentielIfNotExistsAsync();
}