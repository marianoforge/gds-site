import { describe, expect, it } from "vitest";
import {
  buildPropertyIndexRow,
  getTokkoBedrooms,
  getTokkoRooms,
} from "./tokko-property-index";

describe("getTokkoBedrooms", () => {
  it("usa suite_amount como dormitorios", () => {
    expect(getTokkoBedrooms({ suite_amount: 1, room_amount: 2 })).toBe(1);
  });

  it("no usa room_amount como dormitorios", () => {
    expect(getTokkoBedrooms({ room_amount: 2 })).toBe(0);
  });

  it("fallback a bedroom_amount si no hay suite_amount", () => {
    expect(getTokkoBedrooms({ bedroom_amount: 3, room_amount: 4 })).toBe(3);
  });

  it("conserva cero dormitorios", () => {
    expect(getTokkoBedrooms({ suite_amount: 0, bedroom_amount: 2, room_amount: 1 })).toBe(0);
  });
});

describe("getTokkoRooms", () => {
  it("usa room_amount como ambientes", () => {
    expect(getTokkoRooms({ room_amount: 2 })).toBe(2);
  });

  it("no usa suite_amount como ambientes", () => {
    expect(getTokkoRooms({ suite_amount: 1 })).toBe(0);
  });
});

describe("buildPropertyIndexRow", () => {
  it("indexa dormitorios y ambientes por separado", () => {
    const row = buildPropertyIndexRow(
      {
        id: 12345,
        publication_title: "Departamento 2 Ambientes - Olivos",
        type: { name: "Departamento" },
        operations: [{ operation_type: "Venta" }],
        location: { short_location: "Olivos" },
        suite_amount: 1,
        room_amount: 2,
        bathroom_amount: 1,
      },
      1,
    );

    expect(row).not.toBeNull();
    expect(row?.bedrooms).toBe(1);
  });
});
