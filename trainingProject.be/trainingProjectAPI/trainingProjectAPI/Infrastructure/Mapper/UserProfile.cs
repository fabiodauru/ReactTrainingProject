using AutoMapper;
using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.UserRequestDTOs;

namespace trainingProjectAPI.Infrastructure.Mapper;

public class UserProfile :  Profile
{
    public UserProfile()
    {
        Console.WriteLine("gugus");
        CreateMap<User, RegisterRequestDto>().ReverseMap();
    }
}