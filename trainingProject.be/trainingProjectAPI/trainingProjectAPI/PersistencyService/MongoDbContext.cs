using MongoDB.Driver;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models.ResultObjects;
using DeleteResult = trainingProjectAPI.Models.ResultObjects.DeleteResult;

namespace trainingProjectAPI.PersistencyService;

public class MongoDbContext : IPersistencyService
{
    private readonly IMongoDatabase _database;
    private readonly ILogger<MongoDbContext> _logger;
    private readonly string _collectionSuffix;
    private readonly int _idLenght;

    public MongoDbContext(IConfiguration configuration, ILogger<MongoDbContext> logger)
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
    
    public async Task<InsertOneResult<T>> CreateAsync<T>(T? document) where T : IHasId
    {
        var acknowledged = false;
        if (document != null)
        {
            try
            {
                var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
                await collection.InsertOneAsync(document);
                acknowledged = true;
                _logger.LogInformation($"Created document {document.Id} in {typeof(T).Name + _collectionSuffix}");
            }
            catch (Exception)
            {
                _logger.LogError($"Error by inserting document: {document.Id}");
            }
        }

        return new InsertOneResult<T>
        {
            Acknowledged = acknowledged,
            Result = document,
            CreatedOn = DateTime.Now
        };
    }

    public async Task<UpdateResult<T>> UpdateAsync<T>(Guid id, T? document) where T : IHasId
    {
        var acknowledged = false;
        if (id.ToString().Length == _idLenght && document != null)
        {
            try
            {
                var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
                var filter = Builders<T>.Filter.Eq(u => u.Id, id);
                document.Id = id;
                await collection.FindOneAndReplaceAsync(filter, document);
                acknowledged = true;
                _logger.LogInformation($"Updated document {document.Id} in {typeof(T).Name + _collectionSuffix}");
            }
            catch (Exception)
            {
                _logger.LogError($"Error by updating document: {document.Id}");
            }
        }

        return new UpdateResult<T>
        {
            Acknowledged = acknowledged,
            Result = document,
            UpdatedOn = DateTime.Now
        };
    }

    public async Task<DeleteResult> DeleteAsync<T>(Guid id)  where T : IHasId
    {
        var acknowledged = false;
        if (id.ToString().Length == _idLenght)
        {
            try
            {
                var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
                var filter = Builders<T>.Filter.Eq(u => u.Id, id);
                await collection.FindOneAndDeleteAsync(filter);
                acknowledged = true;
                _logger.LogInformation($"Deleted document {id} in {typeof(T).Name + _collectionSuffix}");
            }
            catch (Exception)
            {
                _logger.LogError($"Error by deleting document: {id}");
            }
        }

        return new DeleteResult
        {
            Acknowledged = acknowledged,
            DeletedOn = DateTime.Now
        };
    }

    public async Task<ReadResult<T>> ReadAsync<T>() where T : IHasId
    {
        var found = false;
        var results = new List<T>();
        try
        {
            var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
            results = await collection.Find(Builders<T>.Filter.Empty).ToListAsync();
            found = true;
            _logger.LogInformation($"Found {results.Count} in {typeof(T).Name + _collectionSuffix}");
        }
        catch (Exception)
        {
            _logger.LogError($"Error by reading documents: {typeof(T).Name}");
        }

        return new ReadResult<T>
        {
            Found = found,
            Count = results.Count,
            Results = results
        };
    }
    
    public async Task<FindByIdResult<T>> FindByIdAsync<T>(Guid id) where T : IHasId
    {
        var found = false;
        T? result = default;
        if (id.ToString().Length == _idLenght)
        {
            try
            {
                var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
                var filter = Builders<T>.Filter.Eq(u => u.Id, id);
                var response = await collection.FindAsync(filter);
                result = await response.FirstOrDefaultAsync();
                found = true;
                _logger.LogInformation($"Find {id} in {typeof(T).Name + _collectionSuffix}");
            }
            catch (Exception)
            {
                _logger.LogError($"Error by reading document: {id}");
            }
        }

        return new FindByIdResult<T>
        {
            Found = found,
            Result = result
        };
    }
    
}