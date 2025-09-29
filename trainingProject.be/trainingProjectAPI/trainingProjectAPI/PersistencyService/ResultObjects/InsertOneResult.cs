using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.PersistencyService.ResultObjects;

public class InsertOneResult<T> where T : IHasId
{
    public bool Acknowledged { get; init; }
    public T? Result { get; init; }
}