// matter.js boilerplate
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 30;
const cellsVertical = 23;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height,
    },
});

Render.run(render);
Runner.run(Runner.create(), engine);

// walls
const walls = [
    // top boundary
    Bodies.rectangle(width / 2, 0, width, 2, {
        isStatic: true,
    }),
    // bottom boundary
    Bodies.rectangle(width / 2, height, width, 2, {
        isStatic: true,
    }),
    // left boundary
    Bodies.rectangle(0, height / 2, 2, height, {
        isStatic: true,
    }),
    // right boundary
    Bodies.rectangle(width, height / 2, 2, height, {
        isStatic: true,
    }),
];

World.add(world, walls);

// Maze generation

// Choose randomly where to lay the maze lines
const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

// determine the number of individual cells and make them all closed boxes
const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

// keep track of the vertical walls that we have already opened or closed
const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

// keep track of the horizontal walls that we have already opened or closed
const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

// which cell to start in
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

// how the board gets designed
const movementFunctionality = (row, column) => {
    //If I have visited the cell at [row, column] then do not visit again
    if (grid[row][column]) {
        return;
    }
    // Mark this cell as visited
    grid[row][column] = true;
    // Assemble a randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left'],
    ]);
    // For each neighbor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        // See if that neighbor is out of bounds
        if (
            nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextColumn < 0 ||
            nextColumn >= cellsHorizontal
        ) {
            continue;
        }
        // If we have visited that neighbor then continue on to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }
        // Remove a wall from either the horizontals or verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        movementFunctionality(nextRow, nextColumn);
    }
};

movementFunctionality(startRow, startColumn);

// Draw the horizontal lines of the maze
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                render: {
                    fillStyle: 'white',
                },
                label: 'wall',
                isStatic: true,
            }
        );
        World.add(world, wall);
    });
});

// Draw the vertical lines of the maze
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                render: {
                    fillStyle: 'white',
                },
                label: 'wall',
                isStatic: true,
            }
        );
        World.add(world, wall);
    });
});

// Finish line
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        render: {
            fillStyle: 'green',
        },
        label: 'goal',
        isStatic: true,
    }
);
World.add(world, goal);

// player
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const player = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: 'player',
});
World.add(world, player);

document.addEventListener('keydown', (e) => {
    const { x, y } = player.velocity;

    if (e.keyCode === 38 || e.keyCode === 87) {
        Body.setVelocity(player, { x, y: y - 4 });
    } else if (e.keyCode === 39 || e.keyCode === 68) {
        Body.setVelocity(player, { x: x + 4, y });
    } else if (e.keyCode === 37 || e.keyCode === 65) {
        Body.setVelocity(player, { x: x - 4, y });
    } else if (e.keyCode === 40 || e.keyCode === 83) {
        Body.setVelocity(player, { x, y: y + 4 });
    }
});

// Win condition

Events.on(engine, 'collisionStart', (e) => {
    e.pairs.forEach((collision) => {
        const labels = ['player', 'goal'];

        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach((body) => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});

// Refresh page on win
button = document.querySelector('button');
button.addEventListener('click', function (e) {
    location.reload();
});
