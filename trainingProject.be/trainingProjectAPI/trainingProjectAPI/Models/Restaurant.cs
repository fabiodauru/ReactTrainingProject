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
        [BsonRepresentation(BsonType.String)]
        public required Guid CreatedBy { get; set; }
        public required Location Location { get; set; }
        public int? BeerScore { get; set; }
        public string? Description { get; set; }
        public List<Image>? Images { get; set; }
        public string? WebsiteURL { get; set; }
        
        public Restaurant()
        {
            Id = Guid.NewGuid();
        }
    }
}
