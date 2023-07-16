import type { Ship, ShipField } from '@/types';

export const calculateShipField = (ships: Ship[]): ShipField => {
  const shipField: ShipField = [];
  ships.forEach((ship) => {
    const resShip: ShipField[0] = { killed: false, positions: [] };
    let counter = 0;
    if (ship.direction) {
      while (counter < ship.length) {
        resShip.positions.push({ x: ship.position.x, y: ship.position.y + counter, status: true });
        counter++;
      }
    } else {
      while (counter < ship.length) {
        resShip.positions.push({ x: ship.position.x + counter, y: ship.position.y, status: true });
        counter++;
      }
    }
    shipField.push(resShip);
  });
  return shipField;
};
