namespace trainingProjectAPI.Models
{
    public class Image
    {
        public required Coordinates Coordinates { get; set; }
        public required string Url { get; set; }
        public DateOnly? Date { get; set; }
        public required int UserId { get; set; }
        public string? Description { get; set; }
    }
}
