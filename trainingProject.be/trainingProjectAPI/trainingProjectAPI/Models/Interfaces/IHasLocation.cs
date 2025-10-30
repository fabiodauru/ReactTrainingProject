using trainingProjectAPI.Models.Domain;

namespace trainingProjectAPI.Models.Interfaces;

public interface IHasLocation
{
    public Location Location { get; set; }
}