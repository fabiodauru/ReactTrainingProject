using MongoDB.Driver;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.PersistencyService.ResultObjects;

namespace trainingProjectAPI.PersistencyService;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly ILogger<MongoDbContext> _logger;

    public MongoDbContext(IConfiguration configuration, ILogger<MongoDbContext> logger)
    {
        _logger = logger;
        var connectionString = configuration.GetSection("MongoDbSettings")["ConnectionString"];
        var databaseName = configuration.GetSection("MongoDbSettings")["DatabaseName"];

        if (string.IsNullOrEmpty(connectionString))
        {
            ThrowError<ArgumentException>("MongoDB ConnectionString is not configuration");
        }
        if (string.IsNullOrEmpty(databaseName))
        {
            ThrowError<ArgumentException>("MongoDB DatabaseName is not configuration");
        }

        try
        {
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }
        catch (Exception)
        {
            ThrowError<Exception>("Error by initializing the MongoDB-connection");
        }

    }
    
    public async Task<InsertOneResult<T>> CreateAsync<T>(T? document) where T : IHasId
    {
        var acknowledged = false;
        if (document != null)
        {
            try
            {
                var collection = _database.GetCollection<T>(typeof(T).Name + "Collection");
                await collection.InsertOneAsync(document);
                acknowledged = true;
            }
            catch (Exception)
            {
                _logger.LogError($"Error by inserting document: {document.Id}");
            }
        }

        return new InsertOneResult<T>
        {
            Acknowledged = acknowledged,
            Result = document
        };

    }

    private void ThrowError<T>(string message) where T : Exception
    {
        _logger.LogError(message);
        var exception = (T)Activator.CreateInstance(typeof(T), message)!;
        throw exception;
    }
}