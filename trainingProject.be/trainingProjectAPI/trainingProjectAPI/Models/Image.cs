using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace trainingProjectAPI.Models
{
    public class Image
    {
        public Coordinates? Coordinates { get; set; }
        public required string ImageFile { get; set; }
        public DateOnly? Date { get; set; }
        [BsonRepresentation(BsonType.String)]
        public Guid? UserId { get; set; }
        public string? Description { get; set; }
    }
}
