using trainingProjectAPI.Models.Domain;

namespace trainingProjectAPI.Models.DTOs.RestaurantRequestDTOs;

public class GetClosestrestaurantRequestDto
{
    public required Coordinates Start {get; init; }
    public required Coordinates End {get; init; }
}