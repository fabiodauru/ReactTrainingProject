namespace trainingProjectAPI.PersistencyService.ResultObjects;

public class UpdateResult<T> where T : class
{
    public bool Acknowledged { get; init; }
    public int Count { get; init; }
    public List<T>? Results { get; init; }
}