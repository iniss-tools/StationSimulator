namespace StationSimulator.Application.Schemas;

/// <summary>Obrazky pozadia schem: podporovane typy a najvacsia velkost.</summary>
public static class SchemaBackgrounds
{
    /// <summary>Najvacsi obrazok pozadia.</summary>
    public const int MaxBytes = 8 * 1024 * 1024;

    /// <summary>Podporovane pripony a typ obsahu (bez SVG - mohlo by obsahovat skript).</summary>
    public static readonly IReadOnlyDictionary<string, string> Types = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        [".png"] = "image/png",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".gif"] = "image/gif",
        [".webp"] = "image/webp"
    };

    /// <summary>Precita obsah do pamate; null = je vacsi nez <see cref="MaxBytes" />.</summary>
    public static async Task<byte[]?> ReadAsync(Stream content, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(content);
        using var memory = new MemoryStream();
        var buffer = new byte[81920];
        int read;
        while ((read = await content.ReadAsync(buffer, cancellationToken).ConfigureAwait(false)) > 0)
        {
            if (memory.Length + read > MaxBytes)
                return null;
            memory.Write(buffer, 0, read);
        }

        return memory.ToArray();
    }
}
