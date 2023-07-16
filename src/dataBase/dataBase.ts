import type {Player, Room, Winner, ActiveGame, ShipField} from "@/types";

class db {
  players: Player[] = [];
  rooms: Room[] = [];
  winners: Winner[] = [];
  activeGames: ActiveGame[] = [];

  addPlayer(player: Omit<Player, "active">) {
    this.players.push({...player, active: true});
  }

  deletePlayerByIndex(index: number) {
    this.players.filter((player) => player.index !== index);
  }

  toggleActivePlayer(index: number, state: boolean) {
    const player = this.players.find((player) => player.index === index);
    if (!player) throw Error('User with such username doesn\'t exist');
    player.active = state;
  }

  addRoom(player: Player) {
    const {name, index, isBot} = player;
    const roomId = Math.floor(Math.random() * 1000);

    this.rooms.push({
      roomId,
      roomUsers: [{name, index, isBot}],
    });
  }
  deleteRoom(index: number) {
    this.rooms = this.rooms.filter((room) => room.roomId !== index);
  }

  getPlayerByName(name: string) {
    const player = this.players.find((player) => player.name === name);
    if (!player) throw Error('User with such username doesn\'t exist');
    return player;
  }

  getPlayerByIndex(index: number) {
    return this.players.find((player) => player.index === index);
  }
  getPlayersInRooms() {
    return this.rooms.map((room) => room.roomUsers).flat();
  }

  addPlayerToRoom(indexRoom: number, index: number, isBot = false) {
    const player = this.getPlayerByIndex(index);
    if (player) {
      this.rooms = this.rooms.map((room) => {
        if (room.roomId === indexRoom) {
          room.roomUsers.push({name: player.name, index: player.index, isBot});
        }
        return room;
      });
    }
  }

  getRoomByRoomId(roomId: number) {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  isUserInAnyRoom(index: number) {
    const usersInRooms = this.getPlayersInRooms();
    return usersInRooms.find((user) => user.index === index);
  }

  isUserARoomHost(indexRoom: number, index: number) {
    const roomToCheck = this.rooms.find((room) => room.roomId === indexRoom);
    return roomToCheck?.roomUsers.some((roomUser) => roomUser.index === index);
  }

  updatePlayerIndex(name: string, index: number) {
    const indexOfPlayerToUpdate = this.players.findIndex(
      (player) => player.name === name
    );
    this.players[indexOfPlayerToUpdate].index = index;
  }

  addWinner(index: number) {
    const player = this.getPlayerByIndex(index);
    if (!player) return;
    const winnerIndex = this.winners.findIndex(
      (winner) => winner.name === player.name
    );
    if (winnerIndex !== -1) {
      this.winners[winnerIndex].wins++;
    } else {
      this.winners.push({name: player.name, wins: 1});
    }
  }

  addActiveGame(gameId: number) {
    this.activeGames.push({
      finished: false,
      turn: 0,
      gameId,
      sentShipsCounter: 0,
      players: [],
    });
  }

  getActiveGameByPlayerIndex(index: number) {
    return this.activeGames.find((game) =>
      game.players.some((item) => item.index === index)
    );
  }
  getActiveGameById(gameId: number) {
    return this.activeGames.find((game) => game.gameId === gameId);
  }

  setActiveGameTurn(game: ActiveGame, playerIndex: number) {
    game.turn = playerIndex;
  }

  setActiveGameFinished(game: ActiveGame) {
    game.finished = true;
  }

  deleteActiveGame(game: ActiveGame) {
    this.activeGames = this.activeGames.filter((item) => item !== game);
  }

  updateActiveGameById(gameId: number, index: number, shipField: ShipField) {
    const activeGameIndex = this.activeGames.findIndex(
      (game) => game.gameId === gameId
    );

    const player = this.getPlayerByIndex(index);

    if (activeGameIndex !== undefined && player) {
      ++this.activeGames[activeGameIndex].sentShipsCounter;
      this.activeGames[activeGameIndex].players.push({
        index,
        shipField,
        isBot: player.isBot,
        hittedFields: [],
      });
      return this.activeGames[activeGameIndex];
    }
  }
}

export const dataBase = new db();
