using StationSimulator.Application.Schemas;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Tests.Schemas;

/// <summary>Overenie schemy stanice: platno, prvky, lomene ciary, farby a vazba na zariadenia; tvar JSON v databaze.</summary>
[TestClass]
public sealed class StationSchemaValidatorTests
{
    private static readonly StationSchemaRequestValidator Validator = new();

    private static SchemaElementDto Area(int id = 1) => new() { Id = id, Kind = SchemaElementKind.Platform, X = 10, Y = 20, Width = 300, Height = 30 };

    private static SchemaElementDto Board(int id = 2) =>
        new() { Id = id, Kind = SchemaElementKind.Board, X = 40, Y = 10, Width = 120, Height = 24, Line = 1, Address = 5 };

    private static StationSchemaRequest Schema(params SchemaElementDto[] elements) => new("Nastupistia", 1200, 600, elements);

    private static string[] Codes(StationSchemaRequest request) => Validator.Validate(request).Errors.Select(e => e.ErrorCode).Distinct().ToArray();

    [TestMethod]
    public void Platna_KresbaAjZariadenia()
    {
        var track = new SchemaElementDto
        {
            Id = 3, Kind = SchemaElementKind.Track, Text = "1", Points = [new SchemaPointDto(0, 50), new SchemaPointDto(1200, 50)], Color = "#808080"
        };
        var light = new SchemaElementDto { Id = 4, Kind = SchemaElementKind.Light, Width = 300, Height = 30, Line = 9, Address = 0, Circuit = "Nastupiste 1" };
        var line = new SchemaElementDto { Id = 5, Kind = SchemaElementKind.CommLine, Width = 20, Height = 20, Line = 1 };

        CollectionAssert.AreEqual(Array.Empty<string>(), Codes(Schema(Area(), Board(), track, light, line)));
        CollectionAssert.AreEqual(Array.Empty<string>(), Codes(Schema()));
    }

    [TestMethod]
    public void NazovAPlatno_Medze()
    {
        CollectionAssert.Contains(Codes(Schema() with { Name = "  " }), SchemaErrors.Name);
        CollectionAssert.Contains(Codes(Schema() with { Name = new string('a', 101) }), SchemaErrors.Name);
        CollectionAssert.Contains(Codes(Schema() with { Width = 99 }), SchemaErrors.Size);
        CollectionAssert.Contains(Codes(Schema() with { Height = 20_001 }), SchemaErrors.Size);
        CollectionAssert.Contains(Codes(Schema() with { BackgroundOpacity = 1.5 }), SchemaErrors.Opacity);
        CollectionAssert.Contains(Codes(Schema() with { BackgroundWidth = -1 }), SchemaErrors.BackgroundBox);
        CollectionAssert.Contains(Codes(Schema() with { BackgroundX = 1e9 }), SchemaErrors.BackgroundBox);
        CollectionAssert.AreEqual(Array.Empty<string>(), Codes(Schema() with { BackgroundX = -50, BackgroundY = 20, BackgroundWidth = 800, BackgroundHeight = 400 }));
    }

    [TestMethod]
    public void Prvky_CislaSuJedinecneAKladne()
    {
        CollectionAssert.Contains(Codes(Schema(Area(1), Board(1))), SchemaErrors.ElementId);
        CollectionAssert.Contains(Codes(Schema(Area(0))), SchemaErrors.ElementId);
        CollectionAssert.Contains(Codes(Schema(Enumerable.Range(1, SchemaErrors.MaxElements + 1).Select(Area).ToArray())), SchemaErrors.Elements);
    }

    [TestMethod]
    public void Prvok_RozmeryBodyAFarby()
    {
        CollectionAssert.Contains(Codes(Schema(Area() with { Width = -1 })), SchemaErrors.ElementBox);
        CollectionAssert.Contains(Codes(Schema(Area() with { X = double.NaN })), SchemaErrors.ElementBox);
        CollectionAssert.Contains(Codes(Schema(Area() with { Rotation = 400 })), SchemaErrors.ElementBox);
        CollectionAssert.Contains(Codes(Schema(Area() with { Kind = (SchemaElementKind)99 })), SchemaErrors.ElementKind);
        CollectionAssert.Contains(Codes(Schema(Area() with { Kind = SchemaElementKind.Track, Points = [new SchemaPointDto(0, 0)] })),
            SchemaErrors.ElementPoints);
        CollectionAssert.Contains(Codes(Schema(Area() with { Points = [new SchemaPointDto(0, 1e9)] })), SchemaErrors.ElementPoints);
        CollectionAssert.Contains(Codes(Schema(Area() with { Text = new string('a', SchemaErrors.MaxText + 1) })), SchemaErrors.ElementText);
        CollectionAssert.Contains(Codes(Schema(Area() with { Fill = "red" })), SchemaErrors.ElementColor);
        CollectionAssert.Contains(Codes(Schema(Area() with { Color = "#12345" })), SchemaErrors.ElementColor);
    }

    [TestMethod]
    public void Zariadenie_PotrebujeLinkuAAdresu()
    {
        CollectionAssert.Contains(Codes(Schema(Board() with { Line = null })), SchemaErrors.ElementDevice);
        CollectionAssert.Contains(Codes(Schema(Board() with { Address = null })), SchemaErrors.ElementDevice);
        CollectionAssert.Contains(Codes(Schema(Board() with { Line = 101 })), SchemaErrors.ElementDevice);
        CollectionAssert.Contains(Codes(Schema(Board() with { Address = 256 })), SchemaErrors.ElementDevice);
        CollectionAssert.Contains(Codes(Schema(Board() with { Circuit = new string('a', SchemaErrors.MaxCircuit + 1) })), SchemaErrors.ElementDevice);
    }

    [TestMethod]
    public void Json_KluceAOkruhlaCesta()
    {
        var request = Schema(Area(), Board() with { View = SchemaBoardView.Symbol, Circuit = "Hala" });

        var json = SchemaMapping.Serialize(request);

        StringAssert.Contains(json, "\"kind\":\"platform\"");
        StringAssert.Contains(json, "\"kind\":\"board\"");
        StringAssert.Contains(json, "\"view\":\"symbol\"");
        var dto = SchemaMapping.ToDto(new StationSchemaRecord(7, "Nastupistia", json), "abc");
        Assert.AreEqual(7, dto.Id);
        Assert.AreEqual(1200, dto.Width);
        Assert.AreEqual("abc", dto.Background);
        Assert.AreEqual(0.5, dto.BackgroundOpacity);
        Assert.AreEqual(request.Elements[1], dto.Elements[1] with { Points = request.Elements[1].Points });
        Assert.AreEqual(0, dto.Elements[0].Points.Count);
    }
}
