using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.DTOs;

public class UpdateResponseDto
{
    public required string Name { get; init; }
    public required List<string> UpdatedAttributes { get; init; }
}