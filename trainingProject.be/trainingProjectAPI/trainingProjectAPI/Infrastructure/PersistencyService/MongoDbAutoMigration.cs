using System.Reflection;
using MongoDB.Bson;
using MongoDB.Driver;
using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.Exceptions;
using trainingProjectAPI.Models.Interfaces;


namespace trainingProjectAPI.Infrastructure.PersistencyService;

public class MongoDbAutoMigration
{
    private readonly IMongoDatabase _database;
    private readonly ILogger<MongoDbAutoMigration> _logger;
    private readonly string _collectionSuffix;

    public MongoDbAutoMigration(IConfiguration configuration, ILogger<MongoDbAutoMigration> logger)
    {
        _logger = logger;
        
        var mongoSettings = configuration.GetSection("MongoDbSettings");
        var connectionString = mongoSettings["ConnectionString"] ?? throw new MongoDbException("MongoDB ConnectionString is not configured");
        var databaseName = mongoSettings["DatabaseName"] ?? throw new MongoDbException("MongoDB DatabaseName is not configured");
        var collectionSuffix =  mongoSettings["CollectionSuffix"] ?? throw new MongoDbException("MongoDB CollectionSuffix is not configured");
        try
        {
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
            _collectionSuffix = collectionSuffix;
            _logger.LogInformation($"Created MongoDbMigration for {_database}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred creating MongoDbMigration for {_database}");
            throw;
        }
    }

    public async Task CheckAndMigrateAsync<T>(Dictionary<string, string>? renameMap = null, List<string>? removeFields = null, bool setDefaultsForProperties = true) where T : IHasId
    {
        var collection = _database.GetCollection<T>(typeof(T).Name + _collectionSuffix);

        if (renameMap is { Count: > 0 })
        {
            foreach (var key in renameMap)
            {
                var oldName = key.Key;
                var newName = key.Value;
                
                var filter = Builders<T>.Filter.Exists(oldName) & Builders<T>.Filter.Exists(newName, false);
                var update = Builders<T>.Update.Rename(oldName, newName);
                
                var result = await collection.UpdateManyAsync(filter, update);
                _logger.LogInformation($"Updated MongoDbMigration for {oldName}  to {newName} applied to {result.ModifiedCount} documents");
            }
        }

        if (setDefaultsForProperties)
        {
            var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.CanWrite)
                .ToList();

            foreach (var property in properties)
            {
                var propertyName = property.Name;
                var missingFilter = Builders<T>.Filter.Exists(propertyName, false);
                
                var defaultValue = GetDefaultValueForType(property.PropertyType);
                UpdateDefinition<T> update;
                if (defaultValue != null)
                {
                    update = Builders<T>.Update.Set(propertyName, BsonValue.Create(defaultValue));
                }
                else
                {
                    update = new BsonDocumentUpdateDefinition<T>(new BsonDocument("$set", new BsonDocument(propertyName, BsonNull.Value)));
                }
                var result = await collection.UpdateManyAsync(missingFilter, update);
                if (result.ModifiedCount > 0)
                {
                    _logger.LogInformation($"Set default property {propertyName} applied to {result.ModifiedCount} documents");
                }
            }
        }

        if (removeFields is { Count: > 0 })
        {
            foreach (var field in removeFields)
            {
                var existsFilter = Builders<T>.Filter.Exists(field);
                var update = Builders<T>.Update.Unset(field);
                var result = await collection.UpdateManyAsync(existsFilter, update);
                _logger.LogInformation($"Unset field {field} applied to {result.ModifiedCount} documents");
            }
        }
    }
    
    private object? GetDefaultValueForType(Type type)
    {
        if (type == typeof(DateOnly))
            return DateTime.UtcNow.Date;
        if (type == typeof(DateTime))
            return DateTime.UtcNow.Date;
        if (type == typeof(string))
            return string.Empty;
        if (type == typeof(bool))
            return false;
        if (type.IsEnum)
            return Activator.CreateInstance(type);
        if (type == typeof(Guid))
            return Guid.Empty.ToString();
        if (type.IsPrimitive)
            return Convert.ChangeType(0, type);
        if (type.IsValueType)
            return Activator.CreateInstance(type);
    
        return null; 
    }
}