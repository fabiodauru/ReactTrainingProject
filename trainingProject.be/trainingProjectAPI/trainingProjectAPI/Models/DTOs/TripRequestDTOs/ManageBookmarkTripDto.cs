using System.ComponentModel.DataAnnotations;

namespace trainingProjectAPI.Models.DTOs.TripRequestDTOs;

public class ManageBookmarkTripDto
{
    [Required]
    public Guid TripId { get; set; }
    [Required]
    public bool bookmarking { get; set; }
}