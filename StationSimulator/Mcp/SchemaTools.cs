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
    public static Task<StationSchemaDto> GetSchema(
        IQueryHandler<GetStationSchemasQuery, IReadOnlyList<StationSchemaDto>> handler,
        [Description("Schema number from list_schemas.")] int id,
        CancellationToken cancellationToken) =>
        Find(handler, id, cancellationToken);

    [McpServerTool(Name = "save_schema", Title = "Save station schema", ReadOnly = false, Destructive = false, Idempotent = false, OpenWorld = false,
        UseStructuredContent = true)]
    [Description("Creates a station schema (without id) or replaces an existing one with the given canvas and elements. Coordinates are in canvas "
                 + "units from the top left corner. Drawing kinds: track and path use points (at least two), platform, building and area use x, y, "
                 + "width and height, text uses x, y and text. Device kinds (board, audio, light, amplifier, commLine) need line and, except commLine, "
                 + "address of a simulator device; audio and light may name a circuit. Element ids must be unique positive numbers. "
                 + "The background image is kept; it can only be changed in the web editor.")]
    [Authorize(Policy = Permissions.SchemasManage)]
    public static async Task<StationSchemaDto> SaveSchema(
        IQueryHandler<GetStationSchemasQuery, IReadOnlyList<StationSchemaDto>> schemas,
        ICommandHandler<CreateStationSchemaCommand, StationSchemaDto> create,
        ICommandHandler<SetStationSchemaCommand> update,
        [Description("Schema name.")] string name,
        [Description("Canvas width in canvas units (100-20000).")] int width,
        [Description("Canvas height in canvas units (100-20000).")] int height,
        [Description("Elements in drawing order - later elements cover earlier ones.")] IReadOnlyList<SchemaElementDto> elements,
        [Description("Number of the schema to replace; omit to create a new one.")] int? id = null,
        CancellationToken cancellationToken = default)
    {
        if (id is null)
            return (await create.Handle(new CreateStationSchemaCommand(new StationSchemaRequest(name, width, height, elements)), cancellationToken)).ValueOrThrow();
        var existing = await Find(schemas, id.Value, cancellationToken).ConfigureAwait(false);
        // umiestnenie a krytie obrazka pozadia ostava, nastroj meni len platno a prvky
        var request = new StationSchemaRequest(name, width, height, elements)
        {
            BackgroundOpacity = existing.BackgroundOpacity,
            BackgroundX = existing.BackgroundX,
            BackgroundY = existing.BackgroundY,
            BackgroundWidth = existing.BackgroundWidth,
            BackgroundHeight = existing.BackgroundHeight
        };
        (await update.Handle(new SetStationSchemaCommand(id.Value, request), cancellationToken)).ThrowIfFailed();
        return await Find(schemas, id.Value, cancellationToken).ConfigureAwait(false);
    }

    [McpServerTool(Name = "delete_schema", Title = "Delete station schema", ReadOnly = false, Destructive = true, Idempotent = true, OpenWorld = false,
        UseStructuredContent = true)]
    [Description("Deletes a station schema with its background image. Devices and lines of the simulator are not touched.")]
    [Authorize(Policy = Permissions.SchemasManage)]
    public static async Task<DoneResult> DeleteSchema(
        ICommandHandler<DeleteStationSchemaCommand> handler,
        [Description("Schema number from list_schemas.")] int id,
        CancellationToken cancellationToken)
    {
        (await handler.Handle(new DeleteStationSchemaCommand(id), cancellationToken)).ThrowIfFailed();
        return new DoneResult(string.Create(CultureInfo.InvariantCulture, $"Station schema {id} was deleted."));
    }

    private static async Task<StationSchemaDto> Find(IQueryHandler<GetStationSchemasQuery, IReadOnlyList<StationSchemaDto>> schemas, int id,
        CancellationToken cancellationToken) =>
        (await schemas.Handle(new GetStationSchemasQuery(), cancellationToken)).ValueOrThrow().FirstOrDefault(s => s.Id == id)
        ?? throw new McpException(string.Create(CultureInfo.InvariantCulture, $"schema.notFound: Station schema {id} does not exist."));
}
