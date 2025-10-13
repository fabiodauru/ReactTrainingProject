using trainingProjectAPI.Interfaces;

namespace trainingProjectAPI.DTOs
{
    public class ListResponseDto<T>
    {
        public required List<T> Items { get; init; }
    }
}
