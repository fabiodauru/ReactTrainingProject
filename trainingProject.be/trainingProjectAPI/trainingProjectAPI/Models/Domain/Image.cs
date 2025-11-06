using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace trainingProjectAPI.Models.Domain
{
    public class Image
    {
        public required string ImageFile { get; set; }
        
        [BsonRepresentation(BsonType.String)]
        public string? Description { get; set; }
    }
}
