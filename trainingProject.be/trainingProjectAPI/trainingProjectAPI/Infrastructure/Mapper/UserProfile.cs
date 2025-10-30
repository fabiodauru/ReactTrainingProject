using AutoMapper;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Mapper;

public class UserProfile :  Profile
{
    public UserProfile()
    {
        CreateMap<User, RegisterRequestDto>().ReverseMap();
        CreateMap<User, LoginRequestDto>().ReverseMap();
    }
}