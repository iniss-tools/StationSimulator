using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Application.Virtual;

/// <summary>Zalozi alebo zmeni virtualnu tabulu s cislom <paramref name="Id" />.</summary>
public sealed record SetVirtualBoardCommand(int Id, SetVirtualBoardRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}
