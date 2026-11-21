using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Replay;

/// <summary>Prehra zaznam do liniek simulatora.</summary>
/// <param name="Speed">rychlost; 0 = bez cakania</param>
/// <param name="Loop">dokola</param>
/// <param name="Position">odkial [s]</param>
/// <param name="Paused">len pripravit a pozastavit</param>
public sealed record PlayRecordingCommand(string Name, double Speed, bool Loop, double Position = 0, bool Paused = false) : ICommand<ReplayStatusDto>, IAuditable
{
    string IAuditable.AuditTarget => Name;
}
