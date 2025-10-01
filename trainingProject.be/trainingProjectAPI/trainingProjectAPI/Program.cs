using trainingProjectAPI.Interfaces;
using trainingProjectAPI.PersistencyService;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var config = builder.Configuration;
var rootPath = Directory.GetCurrentDirectory();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

config.SetBasePath(rootPath);
config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

services.AddHttpClient();

services.AddSingleton(config);
services.AddSingleton<IPersistencyService, MongoDbContext>();

services.AddControllers();



services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
}

app.UseHttpsRedirection();
app.MapControllers();
//app.UseAuthentication();
//app.UseAuthorization();

app.Run();