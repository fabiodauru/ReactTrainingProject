using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.PersistencyService;
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

namespace trainingProjectAPI.Services;

public class NewRestaurantService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<NewRestaurantService> _logger;
    private readonly NewMongoDbContext  _context;

    public NewRestaurantService(IPersistencyService persistencyService, ILogger<NewRestaurantService> logger,  NewMongoDbContext context)
    {
        _persistencyService = persistencyService;
        _logger = logger;
        _context = context;
    }
    
    public async Task<Restaurant> CreateRestaurantAsync(Restaurant restaurant)
    {
        try
        {
            if (string.IsNullOrEmpty(restaurant.RestaurantName) ||
                string.IsNullOrWhiteSpace(restaurant.CreatedBy.ToString()))
            {
                throw new ValidationException("Name or CreatedBy is empty");
            }

            var response = await _context.CreateAsync(restaurant);
            _logger.LogInformation($"Created restaurant {response.RestaurantName}");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating restaurant");
            throw;
        }
    }

    public async Task<List<Restaurant>> GetClosestRestaurantAsync(Coordinates start, Coordinates end)
    {
        try
        {
            var centralCoordinates = CalculateCentralCoordinate(start, end);
            var response = await _context.FindNearest<Restaurant>(centralCoordinates, 10) ??
                           throw new NotFoundException("Restaurant not found");
            _logger.LogInformation("Got 10 nearest restaurant");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting closest restaurant");
            throw;
        }
    }

    private Coordinates CalculateCentralCoordinate(Coordinates start, Coordinates end)
    {
        var centralLongitude = (end.Longitude + start.Longitude)/2;
        var centralLatitude = (end.Latitude + start.Latitude)/2;
        return new Coordinates()
        {
            Longitude = centralLongitude,
            Latitude = centralLatitude
        };
    }
}