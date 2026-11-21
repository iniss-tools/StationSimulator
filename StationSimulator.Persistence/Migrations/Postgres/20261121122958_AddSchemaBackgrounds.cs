using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StationSimulator.Persistence.Migrations.Postgres
{
    /// <inheritdoc />
    public partial class AddSchemaBackgrounds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StationSchemaBackgrounds",
                columns: table => new
                {
                    SchemaId = table.Column<int>(type: "integer", nullable: false),
                    ContentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Data = table.Column<byte[]>(type: "bytea", nullable: false),
                    Version = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StationSchemaBackgrounds", x => x.SchemaId);
                    table.ForeignKey(
                        name: "FK_StationSchemaBackgrounds_StationSchemas_SchemaId",
                        column: x => x.SchemaId,
                        principalTable: "StationSchemas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StationSchemaBackgrounds");
        }
    }
}
