using System.ComponentModel;
using StationSimulator.Contracts.Boards;
using StationSimulator.Contracts.Designs;
using StationSimulator.Contracts.Faces;
using StationSimulator.Contracts.Fonts;

namespace StationSimulator.Mcp.Results;

/// <summary>Udaje zobrazenia tabule pre aplikaciu MCP Apps (web/src/mcp-app/board-view.ts).</summary>
public sealed record BoardViewData(
    [property: Description("The board changed; false = the timeout expired.")]
    bool Changed,
    BoardDto Board,
    [property: Description("Content of design.json of the design used; null = default of the renderer.")]
    SetDesignRequest? Design,
    BoardFaceDto? Face,
    [property: Description("ELEN font file of the board; null = none or the view has it already.")]
    FontFileDto? Font);
