using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<ServiceResponse<AuthenticationResponseDto>> CheckLogin(string username, string password);
    Task<ServiceResponse<AuthenticationResponseDto>> Register(User user);
}