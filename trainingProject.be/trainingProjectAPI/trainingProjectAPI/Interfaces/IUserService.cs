using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<ServiceResponse<User>> CheckLogin(string username, string password);
    Task<ServiceResponse<User>> Register(User user);
}