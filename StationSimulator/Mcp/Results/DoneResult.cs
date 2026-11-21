using System.ComponentModel;

namespace StationSimulator.Mcp.Results;

/// <summary>Vysledok zmeny bez dalsich udajov (odstranenie, zastavenie).</summary>
public sealed record DoneResult([property: Description("What was done.")] string Done);
