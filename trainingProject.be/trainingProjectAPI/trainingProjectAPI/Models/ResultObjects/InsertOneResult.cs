using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.Models.ResultObjects;

public class InsertOneResult<T> where T : IHasId
{
    public bool Acknowledged { get; init; }
    public T? Result { get; init; }
    public DateTime CreatedOn { get; init; }
}