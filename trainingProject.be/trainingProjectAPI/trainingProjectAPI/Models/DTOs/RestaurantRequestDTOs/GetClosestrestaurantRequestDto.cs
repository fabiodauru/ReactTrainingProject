using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class GetClosestrestaurantRequestDto
{
    public required Coordinates Start {get; init; }
    public required Coordinates End {get; init; }
}