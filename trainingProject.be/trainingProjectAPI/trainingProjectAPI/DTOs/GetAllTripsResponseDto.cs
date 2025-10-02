using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class GetAllTripsResponseDto: IHasId
{
    public Guid Id { get; set; }
    public List<Trip> Trips {get; set;}
}