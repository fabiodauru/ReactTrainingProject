using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.Exceptions;

namespace trainingProjectAPI.Controllers;

public static class ControllerExtensions
{
    public static Guid GetUserId(this ControllerBase controller)
    {
        var userIdString = controller.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            throw new NotFoundException("User not found");
        }
        if (!Guid.TryParse(userIdString, out var userId))
        {
            throw new ValidationException("Invalid user id");
        }
        return userId;
    }
}