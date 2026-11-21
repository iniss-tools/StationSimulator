import { describe, expect, test } from "bun:test";
import { imageProblem, MAX_IMAGE_BYTES } from "./schema-image";

describe("obrazok pozadia zo suboru", () => {
  test("podporovany obrazok do limitu je v poriadku", () => {
    expect(imageProblem({ name: "Plan.PNG", size: 1000 })).toBeNull();
    expect(imageProblem({ name: "plan.webp", size: MAX_IMAGE_BYTES })).toBeNull();
  });

  test("iny typ, prazdny a privelky subor", () => {
    expect(imageProblem({ name: "plan.svg", size: 1000 })).toBe("error.schema.backgroundType");
    expect(imageProblem({ name: "plan.png", size: 0 })).toBe("error.schema.backgroundEmpty");
    expect(imageProblem({ name: "plan.jpg", size: MAX_IMAGE_BYTES + 1 })).toBe("error.schema.backgroundTooLarge");
  });
});
