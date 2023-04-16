(output) => {
  const board = output.split('|').map(row => row.split(''));
  const nextBoard = [];

  for (let i = 0; i < board.length; i++) {
    const newRow = [];

    for (let j = 0; j < board[i].length; j++) {
      const cell = board[i][j];
      let liveNeighbors = 0;

      // count live neighbors
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (x === 0 && y === 0) continue;

          const neighborRow = i + x;
          const neighborCol = j + y;

          if (neighborRow < 0 || neighborRow >= board.length) continue;
          if (neighborCol < 0 || neighborCol >= board[i].length) continue;

          if (board[neighborRow][neighborCol] === '*') {
            liveNeighbors++;
          }
        }
      }

      // apply rules of game
      if (cell === '*') {
        if (liveNeighbors < 2 || liveNeighbors > 3) {
          newRow.push('.');
        } else {
          newRow.push('*');
        }
      } else {
        if (liveNeighbors === 3) {
          newRow.push('*');
        } else {
          newRow.push('.');
        }
      }
    }

    nextBoard.push(newRow.join(''));
  }

  return nextBoard.join('|');
}