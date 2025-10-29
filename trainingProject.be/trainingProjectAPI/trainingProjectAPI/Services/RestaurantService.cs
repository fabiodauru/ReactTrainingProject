using System.Security.Claims;
using AutoMapper;
using MongoDB.Driver.GeoJsonObjectModel;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

namespace trainingProjectAPI.Services;

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
    
    public async Task<Restaurant> CreateRestaurantAsync(CreateRestaurantRequestDto restaurantDto)
    {
        try
        {
            var restaurant = _mapper.Map<Restaurant>(restaurantDto);
            if (string.IsNullOrEmpty(restaurant.RestaurantName) ||
                string.IsNullOrWhiteSpace(restaurant.CreatedBy.ToString()))
            {
                throw new ValidationException("Name or CreatedBy is empty");
            }
            restaurant.Location.GeoJsonPoint = new GeoJsonPoint<GeoJson2DCoordinates>(new GeoJson2DCoordinates(restaurant.Location.Coordinates!.Latitude, restaurant.Location.Coordinates.Longitude));
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