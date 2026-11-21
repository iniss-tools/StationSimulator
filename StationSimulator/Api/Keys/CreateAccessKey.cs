using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Keys;
using StationSimulator.Contracts.Keys;

namespace StationSimulator.Api.Keys;

/// <summary>POST /api/keys - novy pristupovy kluc (tajna hodnota len v odpovedi).</summary>
public sealed class CreateAccessKey : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("keys", async (CreateAccessKeyRequest request, ICommandHandler<CreateAccessKeyCommand, AccessKeyCreatedDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new CreateAccessKeyCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<AccessKeyCreatedDto>()
            .RequireAuthorization(Permissions.KeysManage);
}
