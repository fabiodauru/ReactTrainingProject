using AutoMapper;
using trainingProjectAPI.DTOs.TripRequestDTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Mapper;

public class TripProfile : Profile
{
    public TripProfile()
    {
        CreateMap<Trip, CreateTripRequestDto>().ReverseMap();
    }
}