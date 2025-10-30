using Amazon.Runtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Feautures.Authentification;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Services;

namespace trainingProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticateController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;

        public AuthenticateController(IUserService userService, IAuthService authService, IEmailService emailService)
        {
            _userService = userService;
            _authService = authService;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginRequestDto loginDto)
        {
            User response = await _userService.LoginAsync(loginDto);
            string token = _authService.CreateJwtToken(response, "Auth");
            Response.Cookies.Append("token",
                                    token,
                                    new CookieOptions
                                    {
                                        HttpOnly = true,
                                        Secure = false,
                                        SameSite = SameSiteMode.Strict,
                                        Expires = DateTime.Now.AddDays(1)
                                    });
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequestDto userDto)
        {
            User response = await _userService.RegisterAsync(userDto);
            return Ok(response);
        }

        //TODO: Maybe anpassen je nachdem wie Elia gemacht hat im Service
        [HttpGet("check-token")]
        public IActionResult CheckToken([FromQuery] string? token = null)
        {
            token ??= Request.Cookies["token"];
            if (!string.IsNullOrEmpty(token))
                token = Uri.UnescapeDataString(token);
            else
                return BadRequest("No token provided");

            (bool isValid, string? purpose) response = _authService.Check(token);

            if (response.isValid)
            {
                return Ok(new { isValid = true, response.purpose });
            }
            return Unauthorized(new { isValid = false });
        }


        [Authorize]
        [HttpPatch("update/password")]
        public async Task<IActionResult> UpdatePassword([FromBody] ChangePasswordRequestDto changePasswordRequestDto)
        {
            Guid userId = this.GetUserId();
            User response =  await _userService.ChangePasswordAsync(userId, changePasswordRequestDto);
            return Ok(response);
        }

        [Authorize]
        [HttpPatch("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto resetPasswordRequestDto)
        {
            Guid userId = this.GetUserId();
            User response =  await _userService.UpdateUserAsync(userId, "Password", resetPasswordRequestDto.Password);
            return Ok(response);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("token");
            return Ok();
        }

        [HttpGet("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            User user = await _userService.GetUserByPropertyAsync("Email", email);
            string resetToken = _authService.CreateJwtToken(user, "PasswordReset", TimeSpan.FromMinutes(5)); //TODO: Maybe add one time use functionality
            _emailService.SendPasswordResetEmail(user.Email, resetToken);
            return Ok("Password reset email sent.");
        }
        
    }
}
