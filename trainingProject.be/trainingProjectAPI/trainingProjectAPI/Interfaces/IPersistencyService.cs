namespace trainingProjectAPI.Interfaces;

public interface IPersistencyService
{
    Task<bool> Create<T>(T document) where T : IHasId;
    Task<List<T>> Read<T>() where T : IHasId;
    Task<bool> Update<T>(Guid id, T newDocument) where T : IHasId;
    Task<bool> Delete<T>(Guid id) where T : IHasId;
    Task<T> GetById<T>(Guid id) where T : IHasId;
}