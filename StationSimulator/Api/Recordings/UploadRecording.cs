using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Recordings;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Api.Recordings;

/// <summary>POST /api/recordings/upload?name= - zaznam z ineho pocitaca (telo = subor).</summary>
public sealed class UploadRecording : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("recordings/upload", async (HttpRequest request, string? name, ICommandHandler<UploadRecordingCommand, RecordingInfoDto> handler,
            CancellationToken cancellationToken) =>
        {
            using var buffer = new MemoryStream();
            await request.Body.CopyToAsync(buffer, cancellationToken);
            var result = await handler.Handle(new UploadRecordingCommand(name ?? "zaznam", buffer.ToArray()), cancellationToken);
            return result.Match(Results.Ok, CustomResults.Problem);
        })
            .Accepts<Stream>("application/octet-stream")
            .Produces<RecordingInfoDto>()
            .RequireAuthorization(Permissions.RecordingsManage);
}
