using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.Models
{
    public class Trip : IHasId
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        public required Coordinates StartCoordinates { get; set; }
        public required Coordinates EndCoordinates { get; set; }
        public required string TripName { get; set; }
        [BsonRepresentation(BsonType.String)]
        public required Guid CreatedBy { get; set; }
        public List<Image>? Images { get; set; }
        public List<Restaurant>? Restaurants { get; set; }
        public TimeSpan? Duration { get; set; }
        public double? Elevation { get; set; }
        public required double Distance { get; set; }
        public int? Difficulty { get; set; }
        public string? Description { get; set; }
        
        public Trip()
        {
            Id = Guid.NewGuid();
        }
    }
}
