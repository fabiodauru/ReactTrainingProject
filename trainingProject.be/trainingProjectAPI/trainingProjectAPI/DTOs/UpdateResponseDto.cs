using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.DTOs;

public class UpdateResponseDto<T> : IIsDto where T : IHasId
{
    public required string Name { get; init; }
    public required List<string> UpdatedAttributes { get; init; }
}