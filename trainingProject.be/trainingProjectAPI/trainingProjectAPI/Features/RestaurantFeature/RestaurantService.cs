using AutoMapper;
using MongoDB.Driver.GeoJsonObjectModel;
using trainingProjectAPI.Infrastructure.PersistencyService;
using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.RestaurantRequestDTOs;
using trainingProjectAPI.Models.Exceptions;
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

namespace trainingProjectAPI.Features.RestaurantFeature;

public class RestaurantService : IRestaurantService
{
    private readonly IPersistencyService _persistencyService;
    private readonly ILogger<RestaurantService> _logger;
    private readonly IMapper _mapper;

    public RestaurantService(IPersistencyService persistencyService, ILogger<RestaurantService> logger,  IMapper mapper)
    {
        _persistencyService = persistencyService;
        _logger = logger;
        _mapper = mapper;
    }
    
    public async Task<Restaurant> CreateRestaurantAsync(CreateRestaurantRequestDto restaurantDto, Guid creatorId)
    {
        try
        {
            var restaurant = _mapper.Map<Restaurant>(restaurantDto);
            restaurant.CreatedBy = creatorId;
            if (string.IsNullOrEmpty(restaurant.RestaurantName) ||
                string.IsNullOrWhiteSpace(restaurant.CreatedBy.ToString()))
            {
                throw new ValidationException("Name or CreatedBy is empty");
            }
            restaurant.Location.GeoJsonPoint = new GeoJsonPoint<GeoJson2DCoordinates>(new GeoJson2DCoordinates(restaurant.Location.Coordinates!.Latitude, restaurant.Location.Coordinates.Longitude));
            restaurant.BeerScores = new List<int>();
            restaurant.BeerScores.Add(restaurantDto.BeerScore);
            restaurant.BeerScoreAverage = restaurant.BeerScores.Average();
            var response = await _persistencyService.CreateAsync(restaurant);
            _logger.LogInformation($"Created restaurant {response.RestaurantName}");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating restaurant");
            throw;
        }
    }

    public async Task<List<Restaurant>> GetClosestRestaurantAsync(GetClosestrestaurantRequestDto dto)
    {
        try
        {
            var centralCoordinates = CalculateCentralCoordinate(dto.Start, dto.End);
            var response = await _persistencyService.FindNearest<Restaurant>(centralCoordinates, 10) ?? throw new NotFoundException("Restaurant not found");
            _logger.LogInformation("Got 10 nearest restaurant");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting closest restaurant");
            throw;
        }
    }

    public async Task<Restaurant> UpdateBeerScoreAsync(UpdateBeerScorerequestDTO dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.RestaurantId.ToString()))
            {
                throw new ValidationException("Restaurant Id is empty");
            }

            var response =
                await _persistencyService.FindAndUpdateByPropertyAsync<Restaurant>(dto.RestaurantId,
                    nameof(Restaurant.BeerScores), dto.BeerScores) ??
                throw new ConflictException("Restaurant not updated");
            
            var uselessResponse = 
                await _persistencyService.FindAndUpdateByPropertyAsync<Restaurant>(dto.RestaurantId,
                    nameof(Restaurant.BeerScoreAverage), CalculateAverage(dto.BeerScores)) ??
                throw new ConflictException("Restaurant not updated");
            
            _logger.LogInformation($"Got {response.RestaurantName} updated BeerScores");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating beer score");
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
    
    private Double CalculateAverage(List<int> beerScores)
    {
        double sum = 0;
        foreach (var beerScore in beerScores)
        {
            sum += beerScore;
        }
        return sum/beerScores.Count;
    }
}