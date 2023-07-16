import type { Ship } from '@/types';
import { shipFieldPattern } from './../utils';

export const createRandomShipsForBot = (): Ship[] => {
  const fieldLength = 10;
  const ships: Ship[] = [
    { position: { x: -10, y: -10 }, direction: false, length: 1, type: 'small' },
  ];

  for (const potentialShip of shipFieldPattern) {
    let x: number, y: number, direction: boolean;
    do {
      direction = Boolean(Math.round(Math.random()));
      x = Math.floor(Math.random() * fieldLength);
      y = Math.floor(Math.random() * fieldLength);
    } while (
      ships.some((ship) => {
        if (direction) {
          const potentialArea = [
            ...Array(potentialShip.length + 2)
              .fill(0)
              .map((_item, index) => ({ x: x - 1, y: y + index - 1 })),
            ...Array(potentialShip.length + 2)
              .fill(0)
              .map((_item, index) => ({ x, y: y + index - 1 })),
            ...Array(potentialShip.length + 2)
              .fill(0)
              .map((_item, index) => ({ x: x + 1, y: y + index - 1 })),
          ];

          if (
            potentialArea.some(
              (item) => item.x < -1 || item.x > fieldLength || item.y < -1 || item.y > fieldLength
            )
          )
            return true;

          const shipArea = [
            ...Array(ship.length)
              .fill(0)
              .map((_item, index) => ({
                x: ship.position.x,
                y: ship.position.y + index,
              })),
          ];

          const checkArr = [...potentialArea, ...shipArea].filter(
            (v, i, a) => a.findIndex((v2) => v2.x === v.x && v2.y === v.y) === i
          );

          if (checkArr.length !== [...potentialArea, ...shipArea].length) return true;

          /* horizontal */
        } else {
          const potentialArea = [
            ...Array(potentialShip.length + 2)
              .fill(0)
              .map((_item, index) => ({ x: x + index - 1, y: y - 1 })),
            ...Array(potentialShip.length + 2)
              .fill(0)
              .map((_item, index) => ({ x: x + index - 1, y })),
            ...Array(potentialShip.length + 2)
              .fill(0)
              .map((_item, index) => ({ x: x + index - 1, y: y + 1 })),
          ];

          if (
            potentialArea.some(
              (item) => item.x < -1 || item.x > fieldLength || item.y < -1 || item.y > fieldLength
            )
          )
            return true;

          const shipArea = [
            ...Array(ship.length)
              .fill(0)
              .map((_item, index) => ({
                x: ship.position.x + index,
                y: ship.position.y,
              })),
          ];

          const checkArr = [...potentialArea, ...shipArea].filter(
            (v, i, a) => a.findIndex((v2) => v2.x === v.x && v2.y === v.y) === i
          );

          if (checkArr.length !== [...potentialArea, ...shipArea].length) return true;
        }
        return false;
      })
    );

    ships.push({ ...potentialShip, position: { x, y }, direction });
  }

  return ships.filter((item) => item.position.x !== -10);
};
