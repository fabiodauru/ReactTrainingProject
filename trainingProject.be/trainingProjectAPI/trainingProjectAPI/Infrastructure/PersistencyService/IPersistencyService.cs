using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.Interfaces;

namespace trainingProjectAPI.Infrastructure.PersistencyService;

public interface IPersistencyService
{
    Task<T> CreateAsync<T>(T? document) where T : IHasId;
    Task<T?> UpdateAsync<T>(Guid id, T? document) where T : IHasId;
    Task DeleteAsync<T>(Guid id) where T : IHasId;
    Task<List<T>?> ReadAsync<T>() where T : IHasId;
    Task<T?> FindByIdAsync<T>(Guid id) where T : IHasId;
    Task<List<T>?> FindByPropertyAsync<T>(string property, object value) where T : IHasId;
    Task<T?> FindAndUpdateByPropertyAsync<T>(Guid id, string updateProperty, object updateValue) where T : IHasId;
    Task<List<T>?> FindNearest<T>(Coordinates coordinates, int number) where T : IHasId, IHasLocation;
}