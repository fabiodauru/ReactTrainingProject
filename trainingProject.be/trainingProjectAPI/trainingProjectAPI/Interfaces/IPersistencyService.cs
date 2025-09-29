using trainingProjectAPI.PersistencyService.ResultObjects;

namespace trainingProjectAPI.Interfaces;

public interface IPersistencyService
{
    Task<InsertOneResult<T>> CreateAsync<T>(T document) where T : IHasId;
    Task<ReadResult<T>> ReadAsync<T>() where T : IHasId;
    Task<UpdateResult<T>> UpdateAsync<T>(Guid id, T newDocument) where T : IHasId;
    Task<DeleteResult> DeleteAsync<T>(Guid id) where T : IHasId;
    Task<FindByIdResult<T>> FindByIdAsync<T>(Guid id) where T : IHasId;
}