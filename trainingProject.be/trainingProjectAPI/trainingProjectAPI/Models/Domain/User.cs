using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using trainingProjectAPI.Models.Interfaces;

namespace trainingProjectAPI.Models.Domain
{
    public class User : IHasId
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Email { get; set; }
        public required string UserFirstName { get; set; }
        public required string UserLastName { get; set; }
        [BsonRepresentation(BsonType.String)]
        public List<Guid> Followers { get; set; } = [];
        [BsonRepresentation(BsonType.String)]
        public List<Guid> Following { get; set; } = [];
        [BsonRepresentation(BsonType.String)]
        public List<Guid> Trips { get; set; } = [];
        [BsonRepresentation(BsonType.String)]
        public List<Guid> BookedTrips { get; set; } = [];
        public List<Tag> Tags { get; set; } = [];
        public required Address Address { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public DateOnly Birthday { get; set; }
        public DateTime JoiningDate { get; set; } = DateTime.Now;
        public int Andrin { get; set; }

        public User()
        {
            Id = Guid.NewGuid();
        }
    }
}
