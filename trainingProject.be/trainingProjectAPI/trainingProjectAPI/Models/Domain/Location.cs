using MongoDB.Driver.GeoJsonObjectModel;

namespace trainingProjectAPI.Models.Domain
{
    public class Location
    {
        public Coordinates? Coordinates { get; set; }
        public GeoJsonPoint<GeoJson2DCoordinates>? GeoJsonPoint { get; set; }
    }
}
