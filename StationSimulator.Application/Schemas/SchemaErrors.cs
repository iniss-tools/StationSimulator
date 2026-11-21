using System.Globalization;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Schemas;

/// <summary>Chyby, kody chyb a medze schem stanice.</summary>
public static class SchemaErrors
{
    public const string Name = "schema.name";
    public const string Size = "schema.size";
    public const string Elements = "schema.elements";
    public const string ElementId = "schema.elementId";
    public const string ElementKind = "schema.elementKind";
    public const string ElementBox = "schema.elementBox";
    public const string ElementPoints = "schema.elementPoints";
    public const string ElementText = "schema.elementText";
    public const string ElementColor = "schema.elementColor";
    public const string ElementDevice = "schema.elementDevice";
    public const string Opacity = "schema.opacity";
    public const string BackgroundType = "schema.backgroundType";

    /// <summary>Najviac prvkov schemy.</summary>
    public const int MaxElements = 1000;

    /// <summary>Najviac bodov lomenej ciary.</summary>
    public const int MaxPoints = 200;

    /// <summary>Najmensi rozmer platna.</summary>
    public const int MinCanvas = 100;

    /// <summary>Najvacsi rozmer platna aj prvku.</summary>
    public const int MaxCanvas = 20_000;

    /// <summary>Najdlhsi text prvku.</summary>
    public const int MaxText = 500;

    /// <summary>Najdlhsi nazov okruhu.</summary>
    public const int MaxCircuit = 100;

    public static Error BackgroundTooLarge() =>
        Error.Problem("schema.backgroundTooLarge",
            string.Create(CultureInfo.InvariantCulture, $"The background image is larger than {SchemaBackgrounds.MaxBytes / (1024 * 1024)} MB."));

    public static Error BackgroundEmpty() => Error.Problem("schema.backgroundEmpty", "The background image is empty.");

    public static Error BackgroundNotFound(int id) =>
        Error.NotFound("schema.backgroundNotFound", string.Create(CultureInfo.InvariantCulture, $"Station schema {id} has no background image."));

    public static Error NotFound(int id) =>
        Error.NotFound("schema.notFound", string.Create(CultureInfo.InvariantCulture, $"Station schema {id} does not exist."));
}
