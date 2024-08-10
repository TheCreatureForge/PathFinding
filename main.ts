tiles.setTilemap(assets.tilemap`level`);
let pathMatrix: number[][] = PathFind();
let visitedMatrix: boolean[][] = createVisitedMatrix(pathMatrix);
printMatrix(pathMatrix);

let scout = sprites.create(assets.image`guy`, SpriteKind.Enemy);
tiles.placeOnRandomTile(scout, assets.tile`spawn`);

// Variables to control smooth movement
let targetX = scout.x;
let targetY = scout.y;
let moveSpeed = 20; // Pixels per second (adjust for speed)
let moving = false; // Track whether the scout is currently moving

game.onUpdate(() => {
    if (!moving) {
        moveScout(scout, pathMatrix, visitedMatrix); // Only set a new target if the scout is not already moving
    }
    updateScoutPosition(scout);
});

function PathFind() { // Finds the path based on the tilemap, thne returns it as a matrix
    let matrix: number[][] = [];
    let width = 10;
    let height = 8;

    for (let j = 0; j < height; j++) {
        matrix[j] = [];
        for (let i = 0; i < width; i++) {
            if (tiles.tileAtLocationEquals(tiles.getTileLocation(i, j), assets.tile`walk`)) {
                matrix[j][i] = 1;  // Mark as walkable
            } else {
                matrix[j][i] = 0;  // Mark as not walkable
            }
        }
    }
    return matrix;
}

function createVisitedMatrix(pathMatrix: number[][]): boolean[][] { // Create a duplicate of the path matrix, this is for tracking where we have been
    let visited: boolean[][] = [];
    for (let i = 0; i < pathMatrix.length; i++) {
        visited[i] = [];
        for (let j = 0; j < pathMatrix[i].length; j++) {
            visited[i][j] = false;  // Initialize all tiles as not visited
        }
    }
    return visited;
}

function moveScout(scout: Sprite, pathMatrix: number[][], visitedMatrix: boolean[][]) {
    let currentLocation = scout.tilemapLocation();
    let currentX = currentLocation.col;
    let currentY = currentLocation.row;

    let directions = [
        { x: 0, y: -1 },  // Up
        { x: 0, y: 1 },   // Down
        { x: -1, y: 0 },  // Left
        { x: 1, y: 0 }    // Right
    ];

    for (let dir of directions) {
        let newX = currentX + dir.x;
        let newY = currentY + dir.y;

        if (newX >= 0 && newX < pathMatrix[0].length && newY >= 0 && newY < pathMatrix.length) {
            if (pathMatrix[newY][newX] == 1 && !visitedMatrix[newY][newX]) {
                targetX = scout.x + dir.x * 16;
                targetY = scout.y + dir.y * 16;
                visitedMatrix[newY][newX] = true;  // Mark this tile as visited
                moving = true; // Set moving to true when a new target is set
                break;
            }
        }
    }
}

function updateScoutPosition(scout: Sprite) { // We needed smooth movement, so we have moving to move to center of the tile SMOOTH
    let deltaX = targetX - scout.x;
    let deltaY = targetY - scout.y;
    let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 1) {
        let moveX = (deltaX / distance) * moveSpeed / 30;
        let moveY = (deltaY / distance) * moveSpeed / 30;

        scout.x += moveX;
        scout.y += moveY;
    } else {
        // Scout has reached the target, snap to the target position
        scout.x = targetX;
        scout.y = targetY;
        moving = false; // Allow moveScout to set a new target
    }
}

function printMatrix(matrix: number[][]) {
    for (let i = 0; i < matrix.length; i++) {
        console.log(matrix[i].join(" "));
    }
}