namespace trainingProjectAPI.Models
{
    public class Location
    {
        public Address? Address { get; set; }
        public required Coordinates Coordinates { get; set; }
    }
}
