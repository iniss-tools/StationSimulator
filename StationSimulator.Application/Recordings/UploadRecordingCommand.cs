using System.Text.Json.Serialization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Recordings;

/// <summary>Ulozi zaznam z ineho pocitaca.</summary>
/// <param name="FileName">meno suboru z prehliadaca (podla neho sa zaznam pomenuje)</param>
/// <param name="Content">obsah suboru</param>
public sealed record UploadRecordingCommand(string FileName, [property: JsonIgnore] byte[] Content) : ICommand<RecordingInfoDto>, IAuditable
{
    string IAuditable.AuditTarget => FileName;
}
