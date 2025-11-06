using MongoDB.Driver.GeoJsonObjectModel;

namespace trainingProjectAPI.Models.Domain
{
    public class Location
    {
        public Address? Address { get; set; }
        public Coordinates? Coordinates { get; set; }
        public GeoJsonPoint<GeoJson2DCoordinates>? GeoJsonPoint { get; set; }
    }
}
