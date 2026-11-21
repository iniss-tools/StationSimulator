using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Virtual;

/// <summary>Odstrani virtualnu tabulu.</summary>
public sealed record DeleteVirtualBoardCommand(int Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}
