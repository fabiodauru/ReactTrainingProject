using AutoMapper;
using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.RestaurantRequestDTOs;

namespace trainingProjectAPI.Infrastructure.Mapper;

public class RestaurantProfile : Profile
{
    public RestaurantProfile()
    {
        CreateMap<Restaurant, CreateRestaurantRequestDto>().ReverseMap();
    }
    
}