using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.Models
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
        public List<Guid> Followers { get; set; } = new();
        public List<Guid> Following { get; set; } = new();
        public List<Trip> Trips { get; set; } = new();
        public List<Trip> BookedTrips { get; set; } = new();
        public List<Tag> Tags { get; set; } = new();
        public required Address Address { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public DateOnly Birthday { get; set; }
        public DateTime JoiningDate { get; set; } = DateTime.Now;

        public User()
        {
            Id = Guid.NewGuid();
        }
    }
}
