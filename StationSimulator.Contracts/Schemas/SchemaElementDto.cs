namespace StationSimulator.Contracts.Schemas;

/// <summary>
/// Prvok schemy stanice. Plochy a zariadenia maju polohu laveho horneho rohu a rozmery, lomene ciary (kolaj, ciara)
/// body. Vsetko v jednotkach platna. Zariadenie sa viaze na linku a adresu simulatora, nie na cislo v databaze -
/// prezije novy import stanice.
/// </summary>
public sealed record SchemaElementDto
{
    /// <summary>Cislo prvku v scheme od 1, v scheme jedinecne.</summary>
    public int Id { get; init; }

    /// <summary>Druh prvku.</summary>
    public SchemaElementKind Kind { get; init; } = SchemaElementKind.Area;

    /// <summary>Vodorovna poloha laveho okraja.</summary>
    public double X { get; init; }

    /// <summary>Zvisla poloha horneho okraja.</summary>
    public double Y { get; init; }

    /// <summary>Sirka.</summary>
    public double Width { get; init; }

    /// <summary>Vyska.</summary>
    public double Height { get; init; }

    /// <summary>Otocenie okolo stredu v stupnoch v smere hodinovych ruciciek.</summary>
    public double Rotation { get; init; }

    /// <summary>Body lomenej ciary (kolaj, ciara); pri inych druhoch prazdne.</summary>
    public IReadOnlyList<SchemaPointDto> Points { get; init; } = [];

    /// <summary>Text prvku: popis plochy, cislo kolaje, text; pri zariadeni popis namiesto jeho nazvu.</summary>
    public string Text { get; init; } = "";

    /// <summary>Velkost pisma textu; 0 = predvolena.</summary>
    public double Size { get; init; }

    /// <summary>Farba ciary, okraja alebo textu <c>#rrggbb</c>; prazdna = predvolena podla druhu a temy.</summary>
    public string Color { get; init; } = "";

    /// <summary>Vypln plochy <c>#rrggbb</c>; prazdna = predvolena podla druhu a temy.</summary>
    public string Fill { get; init; } = "";

    /// <summary>Hrubka ciary alebo okraja; 0 = predvolena.</summary>
    public double Stroke { get; init; }

    /// <summary>Cislo linky zariadenia; null pri kresbe.</summary>
    public int? Line { get; init; }

    /// <summary>Adresa zariadenia na linke; null pri kresbe a pri stave linky.</summary>
    public int? Address { get; init; }

    /// <summary>
    /// Nazov okruhu zariadenia: svetlo alebo audio linka ustredne, fronta vzdialeneho INISSu; prazdny = cele zariadenie.
    /// </summary>
    public string Circuit { get; init; } = "";

    /// <summary>Ako sa kresli tabula.</summary>
    public SchemaBoardView View { get; init; } = SchemaBoardView.Live;

    /// <summary>Zamknuty prvok - v editore sa neda vybrat ani posunut; kreslenie nemeni.</summary>
    public bool Locked { get; init; }
}
