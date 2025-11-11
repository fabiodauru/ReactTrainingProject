using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace trainingProjectAPI.Models.Domain
{
    public class Image
    {
        public required string ImageFile { get; set; }
        public string? Description { get; set; }
    }
}
