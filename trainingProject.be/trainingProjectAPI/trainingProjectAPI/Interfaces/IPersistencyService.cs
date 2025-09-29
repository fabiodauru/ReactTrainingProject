namespace trainingProjectAPI.Interfaces;

public interface IPersistencyService
{
    Task<bool> CreateAsync<T>(T document) where T : IHasId;
    Task<List<T>> ReadAsync<T>() where T : IHasId;
    Task<bool> UpdateAsync<T>(Guid id, T newDocument) where T : IHasId;
    Task<bool> DeleteAsync<T>(Guid id) where T : IHasId;
    Task<T> GetByIdAsync<T>(Guid id) where T : IHasId;
}