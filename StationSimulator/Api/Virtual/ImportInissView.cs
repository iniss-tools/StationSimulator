using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Virtual;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Api.Virtual;

/// <summary>POST /api/virtual/import - virtualne tabule z definicii v subore Web.config INISSView.</summary>
public sealed class ImportInissView : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("virtual/import", async (InissViewImportRequest request, ICommandHandler<ImportInissViewCommand, InissViewImportedDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new ImportInissViewCommand(request.Content, request.Replace), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<InissViewImportedDto>()
            .RequireAuthorization(Permissions.VirtualManage);
}
