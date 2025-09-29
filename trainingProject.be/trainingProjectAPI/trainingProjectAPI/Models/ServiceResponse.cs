using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Models;

public class ServiceResponse<T> where T : IHasId
{
    public required ServiceMessage Message { get; init; }
    public required T? Result { get; init; }
}