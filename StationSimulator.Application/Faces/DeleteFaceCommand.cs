using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Faces;

/// <summary>Odstrani vlastnu predlohu cela, ktoru ziadna tabula nepouziva.</summary>
public sealed record DeleteFaceCommand(string Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
