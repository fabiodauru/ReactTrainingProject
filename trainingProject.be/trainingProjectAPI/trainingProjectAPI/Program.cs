using trainingProjectAPI.Interfaces;
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

config.SetBasePath(rootPath);
config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

services.AddHttpClient();

services.AddSingleton(config);
services.AddScoped<IUserService, UserService>();
services.AddScoped<IPersistencyService, MongoDbContext>();
services.AddScoped<ITripService, TripService>();
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
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowFrontend");

}

app.UseHttpsRedirection();
app.MapControllers();
app.UseAuthentication();
app.UseAuthorization();

app.Run();