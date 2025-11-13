namespace trainingProjectAPI.Models.Domain
{
    public class Address
    {
        public required string Street { get; set; }
        public required string ZipCode { get; set; }
        public required string City { get; set; }
        public required string Country { get; set; }
    }
}
