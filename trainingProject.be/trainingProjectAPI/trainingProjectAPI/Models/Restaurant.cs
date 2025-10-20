namespace trainingProjectAPI.Models
{
    public class Restaurant
    {
        public required string RestaurantName { get; set; }
        public required Location Location { get; set; }
        public int? BeerScore { get; set; }
        public string? description { get; set; }
        public List<Image>? Images { get; set; }
        public string? websiteURL { get; set; }
    }
}
