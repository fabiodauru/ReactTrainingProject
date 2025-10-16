using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace trainingProjectAPI.Models
{
    public class Image
    {
        public required Coordinates Coordinates { get; set; }
        public required string Url { get; set; }
        public DateOnly? Date { get; set; }
        [BsonRepresentation(BsonType.String)]
        public required Guid UserId { get; set; }
        public string? Description { get; set; }
    }
}
