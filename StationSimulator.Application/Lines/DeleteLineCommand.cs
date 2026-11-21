using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Lines;

/// <summary>Odstrani linku aj s jej tabulami a zastavi jej spojenie.</summary>
public sealed record DeleteLineCommand(int Number) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Number.ToString(CultureInfo.InvariantCulture);
}
