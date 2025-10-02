using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.Models.ResultObjects;

public class ReadResult<T> where T : IHasId
{
    public bool Found { get; init; }
    public int Count { get; init; }
    public List<T>? Results { get; init; }
}