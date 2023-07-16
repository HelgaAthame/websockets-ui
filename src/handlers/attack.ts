import type { RequestBody, ResAttackData } from '@/types';
import { createResponse } from '@/handlers';

export const attack = async (parsedBody: RequestBody) => {
  const data = await JSON.parse(parsedBody.data);

  const resData = makeAttack(data);

  if (!resData) return;

  if (Array.isArray(resData)) {
    return resData.map((data) => createResponse('attack', data));
  }

  return [createResponse('attack', resData)];
};

export const createBotAttack = (gameId: number, indexPlayer: number): RequestBody => ({
  type: 'randomAttack',
  data: JSON.stringify({
    gameId,
    indexPlayer,
  }),
  id: 0,
});

export const makeAttack = (attackData: {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}) => {
  const { gameId, indexPlayer: currentPlayer } = attackData;
  const currentGame = db.getActiveGameById(gameId);
  const player = currentGame?.players.find((playerData) => playerData.index === currentPlayer);
  const enemy = currentGame?.players.find((playerData) => playerData.index !== currentPlayer);
  let x: number, y: number;

  /* Check if x and y were provided. If not, make random values,
  but check that field with provided values  was not already hitted */
  if (attackData.x === undefined || attackData.y === undefined) {
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
    } while (player?.hittedFields.some((field) => field.x === x && field.y === y));
  } else {
    x = attackData.x;
    y = attackData.y;
  }

  /* Do not allow player to shoot if player is not current */
  if (currentGame?.turn !== currentPlayer) return;

  /* Do not allow player to shoot same fields multiple times */
  if (player?.hittedFields.find((field) => field.x === x && field.y === y)) return;

  /* If everything is fine push the field to hittedFields for check in next turns */
  player?.hittedFields.push({ x, y });

  let status: ResAttackData['status'] = 'miss';

  const ship = enemy?.shipField.find((ship) => {
    return ship.positions.some((position) => position.x === x && position.y === y);
  });

  const position = ship?.positions.find((position) => position.x === x && position.y === y);

  /* Change status to shot in case of match */
  if (position?.status) {
    status = 'shot';
    position.status = false;
  }
  /* Change status to killed in case of every ship's position was shot */
  if (ship?.positions.every((position) => !position.status)) {
    ship.killed = true;
    status = 'killed';

    /* Shoot empty fields around killed ship */
    const xPositions = new Set(ship.positions.map((position) => position.x));
    const yPositions = new Set(ship.positions.map((position) => position.y));
    const xMin = Math.min(...xPositions);
    const yMin = Math.min(...yPositions);

    const areaWidth = xPositions.size + 2;
    const areaHeight = yPositions.size + 2;
    const areaAround: ResAttackData[] = [];

    for (let i = 0; i < areaWidth; i++) {
      for (let j = 0; j < areaHeight; j++) {
        const xPos = xMin + i - 1;
        const yPos = yMin + j - 1;
        if (
          !ship.positions.some((position) => position.x === xPos && position.y === yPos) &&
          !player?.hittedFields.some((field) => field.x === xPos && field.y === yPos) &&
          xPos <= 9 &&
          xPos >= 0 &&
          yPos >= 0 &&
          yPos <= 9
        ) {
          /* Push those around fields to hitted fields so they are not
          shooted twice in case of random shooting / killing another ship close to them */
          player?.hittedFields.push({ x: xPos, y: yPos });
          areaAround.push({
            position: { x: xPos, y: yPos },
            currentPlayer,
            status: 'miss',
          });
        }
      }
    }
    /*  */

    const res: ResAttackData[] = [];

    /* Check if it was the last enemy ship */
    const isWinner = enemy?.shipField.every((ship) => ship.killed);

    if (isWinner) {
      db.setActiveGameFinished(currentGame);
      if (!enemy?.isBot && !player?.isBot) db.addWinner(currentPlayer);
    }

    ship.positions.forEach(({ x, y }) => {
      res.push({
        position: { x, y },
        currentPlayer,
        status,
      });
    });
    return res.concat(areaAround);
  }

  if (status === 'miss' && enemy) {
    db.setActiveGameTurn(currentGame, enemy.index);
  }

  const res: ResAttackData = {
    position: { x, y },
    currentPlayer,
    status,
  };

  return res;
};
