using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Application.Boards;

/// <summary>Prida tabulu alebo zmeni tabulu s linkou a adresou z adresy poziadavky.</summary>
public sealed record SetBoardCommand(int Line, int Address, SetBoardRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => string.Create(CultureInfo.InvariantCulture, $"{Line}-{Address}");
}
