using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Tokens.Experimental;
using trainingProjectAPI.Interfaces;
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


var  myAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
                      corsPolicyBuilder =>
                      {
                          corsPolicyBuilder.WithOrigins("http://localhost:5173");
                            corsPolicyBuilder.AllowAnyHeader();
                            corsPolicyBuilder.AllowAnyMethod();
                            corsPolicyBuilder.AllowCredentials();
                      });
});

config.SetBasePath(rootPath);
config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

services.AddHttpClient();

services.AddSingleton(config);
services.AddSingleton<IPersistencyService, MongoDbContext>();
services.AddSingleton<ITripService, TripService>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<PasswordHasher<User>>();


services.AddControllers();

services.AddEndpointsApiExplorer();
services.AddSwaggerGen();

services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();

}

app.UseHttpsRedirection();
app.MapControllers();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors(myAllowSpecificOrigins);

app.Run();