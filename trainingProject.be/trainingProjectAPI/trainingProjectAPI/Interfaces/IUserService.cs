using trainingProjectAPI.DTO_s;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<TokenResponseDto<User>> CheckLogin(string username, string password);
    Task<TokenResponseDto<User>> Register(User user);
}