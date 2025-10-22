using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.Models
{
    public class Restaurant : IHasId
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        
        public required string RestaurantName { get; set; }
        public required Guid CreatedBy { get; set; }
        public required Location Location { get; set; }
        public int? BeerScore { get; set; }
        public string? description { get; set; }
        public List<Image>? Images { get; set; }
        public string? websiteURL { get; set; }
        
        public Restaurant()
        {
            Id = Guid.NewGuid();
        }
    }
}
