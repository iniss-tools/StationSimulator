using System.Text.Json.Serialization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Config;

namespace StationSimulator.Application.Config;

/// <summary>
/// Linky a tabule zo suboru exportu alebo povodneho <c>config.json</c>: chybajuce sa pridaju (ako zo zaznamu), alebo
/// nahradia vsetky.
/// </summary>
/// <param name="Content">obsah suboru</param>
/// <param name="Replace">nahradit vsetky linky a tabule</param>
public sealed record ImportConfigCommand([property: JsonIgnore] string Content, bool Replace) : ICommand<ConfigImportedDto>, IAuditable
{
    string IAuditable.AuditTarget => Replace ? "replace" : "add";
}
