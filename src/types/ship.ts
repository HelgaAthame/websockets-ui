export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
};

export type ShipField = {
  killed: boolean;
  positions: {x: number; y: number; status: boolean}[];
}[];
