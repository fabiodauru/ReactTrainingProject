using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class GetAllResponseDto<T> where T: IHasId
{
    public required List<T>? Trips  { get; init; }
}