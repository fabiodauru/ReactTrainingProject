namespace trainingProjectAPI.Models
{
    public class Restaurant
    {
        public required string RestaurantName { get; set; }
        public required Location Location { get; set; }
        public int? BeerScore { get; set; }
    }
}
