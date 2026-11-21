using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Lines;

namespace StationSimulator.Application.Lines;

/// <summary>Prida linku alebo zmeni linku s cislom <paramref name="Number" /> a spusti jej spojenie.</summary>
public sealed record SetLineCommand(int Number, SetLineRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Number.ToString(CultureInfo.InvariantCulture);
}
