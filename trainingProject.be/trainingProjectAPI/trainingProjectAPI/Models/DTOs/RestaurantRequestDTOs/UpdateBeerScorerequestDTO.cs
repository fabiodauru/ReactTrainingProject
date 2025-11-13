namespace trainingProjectAPI.Models.DTOs.RestaurantRequestDTOs;

public class UpdateBeerScorerequestDTO
{
    public required Guid RestaurantId { get; set; }
    public required List<int> BeerScores { get; set; }
}