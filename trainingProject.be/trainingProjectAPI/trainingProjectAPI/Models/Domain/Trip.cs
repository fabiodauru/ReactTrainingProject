using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using trainingProjectAPI.Models.Interfaces;

namespace trainingProjectAPI.Models.Domain
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
        [BsonRepresentation(BsonType.String)]
        public List<Guid>? Restaurants { get; set; }
        public TimeSpan? Duration { get; set; }
        public required double Distance { get; set; }
        public int? Difficulty { get; set; }
        public string? Description { get; set; }
        
        public Trip()
        {
            Id = Guid.NewGuid();
        }
    }
}
