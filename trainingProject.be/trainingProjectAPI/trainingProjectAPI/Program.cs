using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.PersistencyService;
using trainingProjectAPI.Services;
using trainingProjectAPI.Utilities;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var config = builder.Configuration;
var rootPath = Directory.GetCurrentDirectory();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateActor = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("superSecretKey@345IneedMoreBitsPleaseWork")),
            ValidateIssuerSigningKey = true,
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
builder.Services.AddScoped<IRestaurantService, RestaurantService>();
services.AddSingleton<CheckToken>();
services.AddSingleton<PasswordHasher<User>>();

services.AddControllers();
services.AddLogging();

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

app.Run();