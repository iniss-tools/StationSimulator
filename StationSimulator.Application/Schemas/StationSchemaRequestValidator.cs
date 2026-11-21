using System.Text.RegularExpressions;
using FluentValidation;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Application.Schemas;

/// <summary>Schema stanice: nazov, platno, prvky a ich vazba na zariadenia.</summary>
public sealed partial class StationSchemaRequestValidator : AbstractValidator<StationSchemaRequest>
{
    public StationSchemaRequestValidator()
    {
        RuleFor(r => r.Name).Must(n => !string.IsNullOrWhiteSpace(n)).WithErrorCode(SchemaErrors.Name).MaximumLength(100).WithErrorCode(SchemaErrors.Name);
        RuleFor(r => r.Width).InclusiveBetween(SchemaErrors.MinCanvas, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.Size);
        RuleFor(r => r.Height).InclusiveBetween(SchemaErrors.MinCanvas, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.Size);
        RuleFor(r => r.BackgroundOpacity).InclusiveBetween(0, 1).WithErrorCode(SchemaErrors.Opacity);
        RuleFor(r => r.BackgroundX).InclusiveBetween(-SchemaErrors.MaxCanvas, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.BackgroundBox);
        RuleFor(r => r.BackgroundY).InclusiveBetween(-SchemaErrors.MaxCanvas, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.BackgroundBox);
        RuleFor(r => r.BackgroundWidth).InclusiveBetween(0, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.BackgroundBox);
        RuleFor(r => r.BackgroundHeight).InclusiveBetween(0, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.BackgroundBox);
        RuleFor(r => r.Elements).NotNull().Must(e => e.Count <= SchemaErrors.MaxElements).WithErrorCode(SchemaErrors.Elements);
        RuleFor(r => r.Elements).Must(e => e.Where(x => x is not null).Select(x => x.Id).Distinct().Count() == e.Count).When(r => r.Elements is not null)
            .WithErrorCode(SchemaErrors.ElementId).WithMessage("Element ids must be unique.");
        RuleForEach(r => r.Elements).NotNull().WithErrorCode(SchemaErrors.Elements).ChildRules(element =>
        {
            element.RuleFor(e => e.Id).GreaterThan(0).WithErrorCode(SchemaErrors.ElementId);
            element.RuleFor(e => e.Kind).IsInEnum().WithErrorCode(SchemaErrors.ElementKind);
            element.RuleFor(e => e.X).InclusiveBetween(-SchemaErrors.MaxCanvas, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.ElementBox);
            element.RuleFor(e => e.Y).InclusiveBetween(-SchemaErrors.MaxCanvas, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.ElementBox);
            element.RuleFor(e => e.Width).InclusiveBetween(0, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.ElementBox);
            element.RuleFor(e => e.Height).InclusiveBetween(0, SchemaErrors.MaxCanvas).WithErrorCode(SchemaErrors.ElementBox);
            element.RuleFor(e => e.Rotation).InclusiveBetween(-360, 360).WithErrorCode(SchemaErrors.ElementBox);
            element.RuleFor(e => e.Size).InclusiveBetween(0, 1000).WithErrorCode(SchemaErrors.ElementBox);
            element.RuleFor(e => e.Stroke).InclusiveBetween(0, 100).WithErrorCode(SchemaErrors.ElementBox);
            element.RuleFor(e => e.Points).NotNull().Must(p => p.Count <= SchemaErrors.MaxPoints && p.All(IsOnCanvas))
                .WithErrorCode(SchemaErrors.ElementPoints);
            element.RuleFor(e => e.Points).Must(p => p.Count >= 2).When(e => e.Points is not null && IsPolyline(e.Kind))
                .WithErrorCode(SchemaErrors.ElementPoints).WithMessage("A track or path needs at least two points.");
            element.RuleFor(e => e.Text).NotNull().MaximumLength(SchemaErrors.MaxText).WithErrorCode(SchemaErrors.ElementText);
            element.RuleFor(e => e.Color).NotNull().Matches(Color()).WithErrorCode(SchemaErrors.ElementColor).WithMessage("Colors must be #rrggbb.");
            element.RuleFor(e => e.Fill).NotNull().Matches(Color()).WithErrorCode(SchemaErrors.ElementColor).WithMessage("Colors must be #rrggbb.");
            element.RuleFor(e => e.View).IsInEnum().WithErrorCode(SchemaErrors.ElementKind);
            element.RuleFor(e => e.Circuit).NotNull().MaximumLength(SchemaErrors.MaxCircuit).WithErrorCode(SchemaErrors.ElementDevice);
            element.RuleFor(e => e.Line).NotNull().When(e => IsDevice(e.Kind)).WithErrorCode(SchemaErrors.ElementDevice)
                .WithMessage("A device element needs a line.");
            element.RuleFor(e => e.Line).InclusiveBetween(1, 100).When(e => e.Line is not null).WithErrorCode(SchemaErrors.ElementDevice);
            element.RuleFor(e => e.Address).NotNull().When(e => IsDevice(e.Kind) && e.Kind != SchemaElementKind.CommLine)
                .WithErrorCode(SchemaErrors.ElementDevice).WithMessage("A device element needs an address.");
            element.RuleFor(e => e.Address).InclusiveBetween(0, 255).When(e => e.Address is not null).WithErrorCode(SchemaErrors.ElementDevice);
        });
    }

    /// <summary>Prvok je zariadenie simulatora (nie kresba stanice).</summary>
    public static bool IsDevice(SchemaElementKind kind) => kind is SchemaElementKind.Board or SchemaElementKind.Audio or SchemaElementKind.Light
        or SchemaElementKind.Amplifier or SchemaElementKind.CommLine;

    /// <summary>Prvok je lomena ciara urcena bodmi.</summary>
    public static bool IsPolyline(SchemaElementKind kind) => kind is SchemaElementKind.Track or SchemaElementKind.Path;

    private static bool IsOnCanvas(SchemaPointDto? point) =>
        point is { X: >= -SchemaErrors.MaxCanvas and <= SchemaErrors.MaxCanvas, Y: >= -SchemaErrors.MaxCanvas and <= SchemaErrors.MaxCanvas };

    /// <summary>Farba <c>#rrggbb</c> alebo nic.</summary>
    [GeneratedRegex("^(|#[0-9a-fA-F]{6})$", RegexOptions.CultureInvariant)]
    private static partial Regex Color();
}
