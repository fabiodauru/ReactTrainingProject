using AutoMapper;
using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.UserRequestDTOs;

namespace trainingProjectAPI.Infrastructure.Mapper;

public class UserProfile :  Profile
{
    public UserProfile()
    {
        CreateMap<User, RegisterRequestDto>().ReverseMap();
        CreateMap<User, LoginRequestDto>().ReverseMap();
        CreateMap<User, GetAllUsersResponseDto>().ReverseMap();
    }
}