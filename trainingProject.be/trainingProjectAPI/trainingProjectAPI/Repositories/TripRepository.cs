using MongoDB.Driver;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.ResultObjects;
using trainingProjectAPI.PersistencyService;

namespace trainingProjectAPI.Repositories
{
    public class TripRepository
    {
        private readonly IMongoDatabase _database;
        private readonly ILogger<TripRepository> _logger;
        private readonly string _collectionSuffix;
        private readonly int _idLenght;
        
        
        public TripRepository (IConfiguration configuration, ILogger<TripRepository> logger)
        {
            _logger = logger;

            var mongoSettings = configuration.GetSection("MongoDbSettings");
            string connectionString = mongoSettings["ConnectionString"] ?? throw new ArgumentException("MongoDB ConnectionString is not configured");
            string databaseName = mongoSettings["DatabaseName"] ?? throw new ArgumentException("MongoDB DatabaseName is not configured");
            string collectionSuffix = mongoSettings["CollectionSuffix"] ?? throw new ArgumentException("MongoDB CollectionSuffix is not configured");
            if (!int.TryParse(mongoSettings["IdLenght"], out var idLenght))
            {
                throw new ArgumentException("MongoDB IdLenght is not configured or not a valid number");
            }
            try
            {
                var client = new MongoClient(connectionString);
                _database = client.GetDatabase(databaseName);
                _collectionSuffix = collectionSuffix;
                _idLenght = idLenght;
                _logger.LogInformation($"Created MongoDbContext for {_database}");
            }
            catch (Exception)
            {
                throw new ArgumentException("Error by initializing MongoDB");
            }

        }
        
        public async Task<UpdateResult<Trip>> UpdateTripsOwnerAsync(Guid oldOwnerId, Guid newOwnerId)
        {
            bool acknowledged = false;
            try
            {
                var collection = _database.GetCollection<Trip>(nameof(Trip) + _collectionSuffix);
                var filter = Builders<Trip>.Filter.Eq(t => t.CreatedBy, oldOwnerId);
                var update = Builders<Trip>.Update.Set(t => t.CreatedBy, newOwnerId);
                var result = await collection.UpdateManyAsync(filter, update);

                acknowledged = result.IsAcknowledged;
                _logger.LogInformation("Updated trips owner from {OldId} to {NewId}", oldOwnerId, newOwnerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating trip owners from {OldId} to {NewId}", oldOwnerId, newOwnerId);
            }

            return new UpdateResult<Trip>
            {
                Acknowledged = acknowledged,
                UpdatedOn = DateTime.Now
            };
        }

        public async Task<List<Trip>> GetTripsByCreatorIdAsync(Guid creatorId)
        {
            try
            {
                var collection = _database.GetCollection<Trip>(nameof(Trip) + _collectionSuffix);
                var filter = Builders<Trip>.Filter.Eq(t => t.CreatedBy, creatorId);
                var trips = await collection.Find(filter).ToListAsync();
                _logger.LogInformation("Retrieved {Count} trips for creator ID {CreatorId}", trips.Count, creatorId);
                return trips;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trips for creator ID {CreatorId}", creatorId);
                return new List<Trip>();
            }
        }
    }
}
