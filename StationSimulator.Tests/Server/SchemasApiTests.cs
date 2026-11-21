using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using StationSimulator.Contracts.Audit;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Tests.Server;

/// <summary>Schemy stanice cez API: zalozenie, zmena, zmazanie, overenie a ulozenie cez restart servera.</summary>
[TestClass]
[DoNotParallelize]
public sealed class SchemasApiTests
{
    public TestContext TestContext { get; set; } = null!;

    private static StationSchemaRequest Schema(string name = "Nástupištia") => new(name, 1200, 600,
    [
        new SchemaElementDto { Id = 1, Kind = SchemaElementKind.Platform, X = 40, Y = 100, Width = 900, Height = 30, Text = "Nástupište 1" },
        new SchemaElementDto { Id = 2, Kind = SchemaElementKind.Track, Text = "1", Points = [new SchemaPointDto(0, 150), new SchemaPointDto(1200, 150)] },
        new SchemaElementDto { Id = 3, Kind = SchemaElementKind.Board, X = 200, Y = 90, Width = 120, Height = 24, Line = 1, Address = 5 }
    ]);

    private static async Task<string?> CodeOf(HttpResponseMessage response)
    {
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return json.RootElement.TryGetProperty("errors", out var errors) ? errors[0].GetProperty("code").GetString()
            : json.RootElement.TryGetProperty("code", out var code) ? code.GetString() : null;
    }

    [TestMethod]
    public async Task Schema_ZalozenieZmenaAZmazanie()
    {
        await using var server = SimulatorServer.Start();
        var client = server.Client();
        Assert.AreEqual(0, (await client.GetFromJsonAsync<StationSchemaDto[]>("/api/schemas", TestContext.CancellationToken))!.Length);

        var created = await client.PostAsJsonAsync("/api/schemas", Schema("  Nástupištia "), TestContext.CancellationToken);
        Assert.AreEqual(HttpStatusCode.OK, created.StatusCode, await created.Content.ReadAsStringAsync(TestContext.CancellationToken));
        var schema = (await created.Content.ReadFromJsonAsync<StationSchemaDto>(TestContext.CancellationToken))!;
        Assert.AreEqual("Nástupištia", schema.Name);
        Assert.AreEqual(3, schema.Elements.Count);

        var changed = Schema("Hala") with { Elements = [.. Schema().Elements.Take(1)] };
        Assert.AreEqual(HttpStatusCode.NoContent, (await client.PutAsJsonAsync($"/api/schemas/{schema.Id}", changed, TestContext.CancellationToken)).StatusCode);
        var list = (await client.GetFromJsonAsync<StationSchemaDto[]>("/api/schemas", TestContext.CancellationToken))!;
        Assert.AreEqual("Hala", list.Single().Name);
        Assert.AreEqual(SchemaElementKind.Platform, list.Single().Elements.Single().Kind);

        var audit = await client.GetFromJsonAsync<AuditPageDto>("/api/audit?limit=50", TestContext.CancellationToken);
        CollectionAssert.IsSubsetOf(new[] { "CreateStationSchema", "SetStationSchema" }, audit!.Entries.Select(e => e.Action).ToArray());

        Assert.AreEqual(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/schemas/{schema.Id}", TestContext.CancellationToken)).StatusCode);
        var again = await client.DeleteAsync($"/api/schemas/{schema.Id}", TestContext.CancellationToken);
        Assert.AreEqual(HttpStatusCode.NotFound, again.StatusCode);
        Assert.AreEqual("schema.notFound", await CodeOf(again));
        var missing = await client.PutAsJsonAsync($"/api/schemas/{schema.Id}", Schema(), TestContext.CancellationToken);
        Assert.AreEqual("schema.notFound", await CodeOf(missing));
    }

    [TestMethod]
    public async Task Schema_OverenieVratiKodChyby()
    {
        await using var server = SimulatorServer.Start();
        var client = server.Client();

        var noName = await client.PostAsJsonAsync("/api/schemas", Schema(" "), TestContext.CancellationToken);
        Assert.AreEqual(HttpStatusCode.BadRequest, noName.StatusCode);
        Assert.AreEqual("schema.name", await CodeOf(noName));

        var board = new SchemaElementDto { Id = 1, Kind = SchemaElementKind.Board, Width = 100, Height = 20 };
        var noDevice = await client.PostAsJsonAsync("/api/schemas", Schema() with { Elements = [board] }, TestContext.CancellationToken);
        Assert.AreEqual("schema.elementDevice", await CodeOf(noDevice));
    }

    [TestMethod]
    public async Task Pozadie_NahratieZmenaAZmazanie()
    {
        await using var server = SimulatorServer.Start();
        var client = server.Client();
        var created = await client.PostAsJsonAsync("/api/schemas", Schema() with { BackgroundOpacity = 0.3 }, TestContext.CancellationToken);
        var schema = (await created.Content.ReadFromJsonAsync<StationSchemaDto>(TestContext.CancellationToken))!;
        Assert.IsNull(schema.Background);
        Assert.AreEqual(HttpStatusCode.NotFound, (await client.GetAsync($"/api/schemas/{schema.Id}/background", TestContext.CancellationToken)).StatusCode);

        byte[] image = [0x89, 0x50, 0x4E, 0x47, 1, 2, 3];
        var first = await Upload(client, schema.Id, "plan.PNG", image);
        Assert.AreEqual(HttpStatusCode.OK, first.StatusCode, await first.Content.ReadAsStringAsync(TestContext.CancellationToken));
        var version = (await first.Content.ReadFromJsonAsync<SchemaBackgroundDto>(TestContext.CancellationToken))!.Version;

        var listed = (await client.GetFromJsonAsync<StationSchemaDto[]>("/api/schemas", TestContext.CancellationToken))!.Single();
        Assert.AreEqual(version, listed.Background);
        Assert.AreEqual(0.3, listed.BackgroundOpacity);
        var served = await client.GetAsync($"/api/schemas/{schema.Id}/background?v={version}", TestContext.CancellationToken);
        Assert.AreEqual("image/png", served.Content.Headers.ContentType?.MediaType);
        CollectionAssert.AreEqual(image, await served.Content.ReadAsByteArrayAsync(TestContext.CancellationToken));

        // nove nahratie nahradi obrazok a zmeni verziu, ulozenie schemy obrazok nechava
        var second = await Upload(client, schema.Id, "plan.jpg", [9, 8, 7]);
        var next = (await second.Content.ReadFromJsonAsync<SchemaBackgroundDto>(TestContext.CancellationToken))!.Version;
        Assert.AreNotEqual(version, next);
        Assert.AreEqual(HttpStatusCode.NoContent, (await client.PutAsJsonAsync($"/api/schemas/{schema.Id}", Schema("Hala"), TestContext.CancellationToken)).StatusCode);
        Assert.AreEqual(next, (await client.GetFromJsonAsync<StationSchemaDto[]>("/api/schemas", TestContext.CancellationToken))!.Single().Background);

        Assert.AreEqual(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/schemas/{schema.Id}/background", TestContext.CancellationToken)).StatusCode);
        Assert.AreEqual("schema.backgroundNotFound", await CodeOf(await client.DeleteAsync($"/api/schemas/{schema.Id}/background", TestContext.CancellationToken)));
        Assert.IsNull((await client.GetFromJsonAsync<StationSchemaDto[]>("/api/schemas", TestContext.CancellationToken))!.Single().Background);

        // schema sa zmaze aj s obrazkom
        await Upload(client, schema.Id, "plan.webp", [1]);
        Assert.AreEqual(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/schemas/{schema.Id}", TestContext.CancellationToken)).StatusCode);
        Assert.AreEqual(HttpStatusCode.NotFound, (await client.GetAsync($"/api/schemas/{schema.Id}/background", TestContext.CancellationToken)).StatusCode);
    }

    [TestMethod]
    public async Task Pozadie_OdmietneZlyTypVelkostANeznamuSchemu()
    {
        await using var server = SimulatorServer.Start();
        var client = server.Client();
        var created = await client.PostAsJsonAsync("/api/schemas", Schema(), TestContext.CancellationToken);
        var id = (await created.Content.ReadFromJsonAsync<StationSchemaDto>(TestContext.CancellationToken))!.Id;

        Assert.AreEqual("schema.backgroundType", await CodeOf(await Upload(client, id, "plan.svg", [1, 2])));
        Assert.AreEqual("schema.backgroundEmpty", await CodeOf(await Upload(client, id, "plan.png", [])));
        Assert.AreEqual("schema.backgroundTooLarge", await CodeOf(await Upload(client, id, "plan.png", new byte[8 * 1024 * 1024 + 1])));
        Assert.AreEqual("schema.notFound", await CodeOf(await Upload(client, id + 1, "plan.png", [1, 2])));
    }

    private Task<HttpResponseMessage> Upload(HttpClient client, int id, string name, byte[] content)
    {
        var body = new ByteArrayContent(content);
        body.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
        return client.PutAsync($"/api/schemas/{id}/background?name={name}", body, TestContext.CancellationToken);
    }

    [TestMethod]
    public async Task Schema_PrezijeRestartServera()
    {
        string folder;
        int id;
        await using (var server = SimulatorServer.Start(deleteFolder: false))
        {
            folder = server.DataFolder;
            var created = await server.Client().PostAsJsonAsync("/api/schemas", Schema(), TestContext.CancellationToken);
            id = (await created.Content.ReadFromJsonAsync<StationSchemaDto>(TestContext.CancellationToken))!.Id;
        }

        await using var reopened = SimulatorServer.Open(folder, deleteFolder: true);
        var list = (await reopened.Client().GetFromJsonAsync<StationSchemaDto[]>("/api/schemas", TestContext.CancellationToken))!;
        Assert.AreEqual(id, list.Single().Id);
        Assert.AreEqual(2, list.Single().Elements[1].Points.Count);
        Assert.AreEqual(5, list.Single().Elements[2].Address);
    }
}
