using AutoMapper;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Mapper;

public class RestaurantProfile : Profile
{
    public RestaurantProfile()
    {
        CreateMap<Restaurant, CreateRestaurantRequestDto>().ReverseMap();
    }
    
}