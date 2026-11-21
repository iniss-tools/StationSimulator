using System.ComponentModel;
using System.Globalization;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Authorization;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Schemas;
using StationSimulator.Contracts.Schemas;
using StationSimulator.Mcp.Results;

namespace StationSimulator.Mcp;

/// <summary>Nastroje schem stanice.</summary>
[McpServerToolType]
[UsedImplicitly(ImplicitUseTargetFlags.WithMembers)]
public static class SchemaTools
{
    [McpServerTool(Name = "list_schemas", Title = "Station schemas", ReadOnly = true, Idempotent = true, OpenWorld = false, UseStructuredContent = true)]
    [Description("Station schemas: plans of the station with drawing elements and the simulator devices placed on them. Use get_schema for the elements.")]
    [Authorize(Policy = Permissions.SimulatorView)]
    public static async Task<SchemasResult> ListSchemas(
        IQueryHandler<GetStationSchemasQuery, IReadOnlyList<StationSchemaDto>> handler,
        CancellationToken cancellationToken) =>
        new((await handler.Handle(new GetStationSchemasQuery(), cancellationToken)).ValueOrThrow().Select(s => new SchemaSummary(s.Id, s.Name, s.Width,
            s.Height, s.Elements.Count(e => !StationSchemaRequestValidator.IsDevice(e.Kind)), s.Elements.Count(e => StationSchemaRequestValidator.IsDevice(e.Kind)),
            s.Background is not null)).ToList());

    [McpServerTool(Name = "get_schema", Title = "Station schema", ReadOnly = true, Idempotent = true, OpenWorld = false, UseStructuredContent = true)]
    [Description("One station schema with all elements in drawing order (later elements cover earlier ones). A device element points to a simulator "
                 + "device by line and address (board id is line-address) and, for a light or audio circuit, by the circuit name; "
                 + "its live state comes from get_board, get_aksignal or get_state.")]
    [Authorize(Policy = Permissions.SimulatorView)]
    public static async Task<StationSchemaDto> GetSchema(
        IQueryHandler<GetStationSchemasQuery, IReadOnlyList<StationSchemaDto>> handler,
        [Description("Schema number from list_schemas.")] int id,
        CancellationToken cancellationToken) =>
        (await handler.Handle(new GetStationSchemasQuery(), cancellationToken)).ValueOrThrow().FirstOrDefault(s => s.Id == id)
        ?? throw new McpException(string.Create(CultureInfo.InvariantCulture, $"schema.notFound: Station schema {id} does not exist."));
}
