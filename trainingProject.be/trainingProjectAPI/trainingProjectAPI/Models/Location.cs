using MongoDB.Driver.GeoJsonObjectModel;

namespace trainingProjectAPI.Models
{
    public class Location
    {
        public Address? Address { get; set; }
        public required Coordinates Coordinates { get; set; }
        public GeoJsonPoint<GeoJson2DCoordinates> GeoJsonPoint { get; set; }
    }
}
