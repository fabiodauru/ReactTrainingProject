using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using trainingProjectAPI.Exceptions;
using trainingProjectAPI.Feautures.Authentification;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Mapper;
using trainingProjectAPI.Models;
using trainingProjectAPI.PersistencyService;
using trainingProjectAPI.Services;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var config = builder.Configuration;
var rootPath = Directory.GetCurrentDirectory();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();


var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings.GetValue<string>("SecretKey");

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateActor = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey ?? throw new InvalidOperationException())),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();


config.SetBasePath(rootPath);
config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

services.AddHttpClient();

services.AddSingleton(config);
services.AddScoped<IUserService, UserService>();
services.AddScoped<IPersistencyService, MongoDbContext>();
services.AddScoped<ITripService, TripService>();
services.AddScoped<IEmailService, EmailService>();
services.AddScoped<IAuthService, AuthService>();
services.AddScoped<IRestaurantService, RestaurantService>();
services.AddSingleton<PasswordHasher<User>>();

services.AddControllers();
services.AddLogging();

services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<TripProfile>();
    cfg.AddProfile<UserProfile>();
    cfg.AddProfile<RestaurantProfile>();
});


services.AddEndpointsApiExplorer();
services.AddSwaggerGen();

services.AddOpenApi();

services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // React Dev Server
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        policy.WithOrigins("http://localhost:5174") // React Dev Server, ka wieso aber de het sich bi mir veränderet. Edit: De fehler entstoht wenn mer s'ganze frontend zweimal ufmacht, denn wird de localhost port zugwise.
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.Use(async (context, next) =>
{
    var token = context.Request.Cookies["token"];
    if (!string.IsNullOrEmpty(token))
    {
        context.Request.Headers.Append("Authorization", $"Bearer {token}");
    }
    await next();
});


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowFrontend");

}

//app.UseHttpsRedirection(); suscht laufts ned bim Andrin
app.MapControllers();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ExceptionMiddleware>();

app.Run();