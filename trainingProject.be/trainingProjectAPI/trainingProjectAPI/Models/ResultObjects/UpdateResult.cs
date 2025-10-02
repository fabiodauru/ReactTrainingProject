using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.Models.ResultObjects;

public class UpdateResult<T> where T : IHasId
{
    public bool Acknowledged { get; init; }
    public T? Result { get; init; }
    public DateTime UpdatedOn { get; init; }
}