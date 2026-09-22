using Npgsql;
using System.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TauliPractiques.Api.Resources;
using TauliPractiques.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Tauli API", Version = "v1" });

    // Permet enviar el token JWT des de Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Introdueix el token JWT"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Base de dades
var connectionString = builder.Configuration.GetConnectionString("PostgresConnection");
builder.Services.AddTransient<IDbConnection>(_ => new NpgsqlConnection(connectionString));

// Injecció de dependències
builder.Services.AddScoped<UserResource>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<AssignmentResource>();
builder.Services.AddScoped<AssignmentService>();
builder.Services.AddScoped<SessionResource>();
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<AssignmentScheduleResource>();
builder.Services.AddScoped<AssignmentScheduleService>();
builder.Services.AddScoped<ClinicalTutorResource>();
builder.Services.AddScoped<ClinicalTutorService>();
builder.Services.AddScoped<RubricResource>();
builder.Services.AddScoped<EvaluationResource>();
builder.Services.AddScoped<RubricService>();
builder.Services.AddScoped<EvaluationService>();
builder.Services.AddScoped<CoordinatorResource>();
builder.Services.AddScoped<CoordinatorService>();
builder.Services.AddScoped<AcademicTutorResource>();
builder.Services.AddScoped<AcademicTutorService>();
builder.Services.AddScoped<AttendanceResource>();
builder.Services.AddScoped<AttendanceService>();
builder.Services.AddScoped<SessionChangeRequestResource>();
builder.Services.AddScoped<SessionChangeRequestService>();
builder.Services.AddScoped<AnnouncementResource>();
builder.Services.AddScoped<AnnouncementService>();


// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins(
            "http://localhost:5173",
            "http://192.168.94.213:5173"  // <-- afegeix la teva IP
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});
var app = builder.Build();

// Pipeline (ordre important)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Tauli API V1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthentication(); // abans d'Authorization
app.UseAuthorization();
app.MapControllers();

app.Run();