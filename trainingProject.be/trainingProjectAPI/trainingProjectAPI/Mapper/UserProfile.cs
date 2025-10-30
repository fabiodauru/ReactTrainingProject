using AutoMapper;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Mapper;

public class UserProfile :  Profile
{
    public UserProfile()
    {
        Console.WriteLine("gugus");
        CreateMap<User, RegisterRequestDto>().ReverseMap();
    }
}