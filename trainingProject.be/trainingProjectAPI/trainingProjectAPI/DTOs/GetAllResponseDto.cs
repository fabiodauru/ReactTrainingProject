using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.DTOs;

public class GetAllResponseDto<T>: IIsDto where T: IHasId
{
    public required List<T>? Result  { get; init; }
}