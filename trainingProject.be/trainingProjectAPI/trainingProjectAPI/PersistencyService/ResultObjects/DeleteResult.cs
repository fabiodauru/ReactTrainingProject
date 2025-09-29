namespace trainingProjectAPI.PersistencyService.ResultObjects;

public class DeleteResult
{
    public bool Acknowledged { get; init; }
    public int Count { get; init; }
}