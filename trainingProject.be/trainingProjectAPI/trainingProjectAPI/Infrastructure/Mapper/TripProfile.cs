using AutoMapper;
using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.TripRequestDTOs;

namespace trainingProjectAPI.Infrastructure.Mapper;

public class TripProfile : Profile
{
    public TripProfile()
    {
        CreateMap<Trip, CreateTripRequestDto>().ReverseMap();
    }
}