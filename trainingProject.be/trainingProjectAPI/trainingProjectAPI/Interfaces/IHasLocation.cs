using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IHasLocation
{
    public Location Location { get; set; }
}