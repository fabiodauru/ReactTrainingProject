using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

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
        string connectionString = mongoSettings["ConnectionString"] ?? throw new MongoDbException("MongoDB ConnectionString is not configured");
        string databaseName = mongoSettings["DatabaseName"] ?? throw new MongoDbException("MongoDB DatabaseName is not configured");
        string collectionSuffix = mongoSettings["CollectionSuffix"] ?? throw new MongoDbException("MongoDB CollectionSuffix is not configured");
        if (!int.TryParse(mongoSettings["IdLenght"], out var idLenght))
        {
            throw new MongoDbException("MongoDB IdLenght is not configured or not a valid number");
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
            throw new MongoDbException("Error by initializing MongoDB");
        }
    }
    
    public async Task<T> CreateAsync<T>(T? document) where T : IHasId
    {
        try
        {
            if (document == null)
            {
                throw new MongoDbException("Document is null");
            }
            var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
            await collection.InsertOneAsync(document);
            _logger.LogInformation($"Insert document {document.Id} in {typeof(T).Name + _collectionSuffix}");
            return document;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error by inserting document");
            throw;
        }
    }
    
    public async Task<T?> UpdateAsync<T>(Guid id, T? document) where T : IHasId
    {
        try
        { 
            if (id.ToString().Length == _idLenght && document != null) 
            {
                throw new MongoDbException("Document or ID does not match");
            }
            var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
            var filter = Builders<T>.Filter.Eq(u => u.Id, id);
            document!.Id = id;
            await collection.FindOneAndReplaceAsync(filter, document);
            _logger.LogInformation($"Replaced document {document.Id} in {typeof(T).Name + _collectionSuffix}");
            return document;
        }
        catch (Exception ex)
        { 
            _logger.LogError(ex, $"Error by replacing document");
            throw;
        }
    }
    
    public async Task DeleteAsync<T>(Guid id)  where T : IHasId
    {
        if (id.ToString().Length == _idLenght)
        {
            try
            {
                if (id.ToString().Length == _idLenght)
                {
                    throw new MongoDbException("ID does not match");
                }
                var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
                var filter = Builders<T>.Filter.Eq(u => u.Id, id);
                await collection.FindOneAndDeleteAsync(filter);
                _logger.LogInformation($"Removing document {id} in {typeof(T).Name + _collectionSuffix}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error by removing document: {id}");
                throw;
            }
        }
    }
    
    public async Task<List<T>?> ReadAsync<T>() where T : IHasId
    {
        try
        {
            var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
            var results = await collection.Find(Builders<T>.Filter.Empty).ToListAsync();
            _logger.LogInformation($"Read {results.Count} in {typeof(T).Name + _collectionSuffix}");
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error by reading documents: {typeof(T).Name}");
            throw;
        }
    }
    
    public async Task<T?> FindByIdAsync<T>(Guid id) where T : IHasId
    {
        try
        {
            if (id.ToString().Length != _idLenght)
            { 
                throw new MongoDbException("ID does not match");
            }
            var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
            var filter = Builders<T>.Filter.Eq(u => u.Id, id);
            var response = await collection.FindAsync(filter);
            var result = await response.FirstOrDefaultAsync();
            _logger.LogInformation($"Find {id} in {typeof(T).Name + _collectionSuffix}");
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error by reading document: {id}");
            throw;
        }
    }
    
    
    public async Task<List<T>?> FindByPropertyAsync<T>(string property, object value) where T : IHasId
    {
        try
        {
            if (String.IsNullOrEmpty(property))
            {
                throw new MongoDbException("Property does not match");
            }
            var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
            var filter = Builders<T>.Filter.Eq(property, value);
            var response = await collection.FindAsync(filter);
            var result = await response.ToListAsync();
            _logger.LogInformation($"Find {property} in {typeof(T).Name + _collectionSuffix}");
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error by reading document: {property}");
            throw;
        }
    }
    
    public async Task<T?> FindAndUpdateByPropertyAsync<T>(Guid id, string updateProperty, object updateValue) where T : IHasId
    {
        try
        {
            if (id.ToString().Length == _idLenght)
            { 
                throw new MongoDbException("ID does not match");
            }
            if (string.IsNullOrEmpty(updateProperty))
            {
                throw new MongoDbException("Update property must not be null or empty.");
            }
            var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
            var filter = Builders<T>.Filter.Eq(u => u.Id, id);
            var update = Builders<T>.Update.Set(updateProperty, updateValue);
            var updatedDocument = await collection.FindOneAndUpdateAsync(filter, update);
            _logger.LogInformation($"Updated {updateProperty} for {typeof(T).Name + _collectionSuffix} with ID: {id}");
            return updatedDocument;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating document in {typeof(T).Name + _collectionSuffix}");
            throw;
        }
    }

    public async Task<List<T>?> FindNearest<T>(Coordinates coordinates, int number) where T : IHasId, IHasLocation
    {
        try
        {
            if (number < 1)
            {
                throw new MongoDbException("Nearest number must be greater than zero.");
            }
            var location = new GeoJsonPoint<GeoJson2DCoordinates>(new GeoJson2DCoordinates(coordinates.Latitude, coordinates.Longitude));  
            var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);
            var filter = Builders<T>.Filter.NearSphere(s => s.Location.GeoJsonPoint, location);
            var nearest = await collection.Find(filter).Limit(number).ToListAsync();
            _logger.LogInformation($"Nearest {number} in {typeof(T).Name + _collectionSuffix}");
            return nearest;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error searching nearest {typeof(T).Name + _collectionSuffix}");
            throw;
        }
    }
}