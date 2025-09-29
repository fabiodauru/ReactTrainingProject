using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.PersistencyService.ResultObjects;

public class FindByIdResult<T> where T : IHasId
{
    public bool Found { get; init; }
    public T? Result { get; init; }
}