using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using trainingProjectAPI.Models.Interfaces;

namespace trainingProjectAPI.Models.Domain
{
    public class Restaurant : IHasId, IHasLocation
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        public required string RestaurantName { get; set; }
        [BsonRepresentation(BsonType.String)]
        public required Guid CreatedBy { get; set; }
        public required Location Location { get; set; }
        public double? BeerScoreAverage { get; set; }
        public List<int> BeerScores { get; set; }
        public string? Description { get; set; }
        public List<Image>? Images { get; set; }
        public string? WebsiteURL { get; set; }
        
        public Restaurant()
        {
            Id = Guid.NewGuid();
        }
    }
}
