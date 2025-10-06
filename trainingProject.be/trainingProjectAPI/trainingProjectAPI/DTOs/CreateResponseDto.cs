using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class CreateResponseDto : IIsDto
{
    public required string Name { get; init; }
}