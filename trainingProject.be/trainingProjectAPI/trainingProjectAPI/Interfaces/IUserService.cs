using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<ServiceResponse<AuthenticationResponseDto>> CheckLoginAsync(string username, string password);
    Task<ServiceResponse<AuthenticationResponseDto>> RegisterAsync(User user);

    Task<UserResponseDto<User>> GetUserByIdAsync(Guid userId);
    Task<ListResponseDto<TripReponseDto>> GetUserTripsAsync(Guid userId);
}