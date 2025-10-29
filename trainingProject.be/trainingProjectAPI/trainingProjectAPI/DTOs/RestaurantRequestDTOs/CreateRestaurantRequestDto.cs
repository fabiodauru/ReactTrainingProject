using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs
{
    public class CreateRestaurantRequestDto
    {
        public required string RestaurantName { get; set; }
        public required Coordinates Location { get; set; }
        public int BeerScore { get; set; }
        public string Description { get; set; }
        public List<Image>? Images { get; set; }
        public string WebsiteURL { get; set; }
    }
}
