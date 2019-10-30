const { Repeat, List } = require("immutable");
const { performance } = require("perf_hooks");

function availableDirections(board, x, y) {
    let res = [];
    const mX = board.size - 1;
    const mY = board.size - 1;
    if (x + 1 <= mX && !isTraversed(board.getIn([x + 1, y]))) res.push([x + 1, y, "S"]);
    if (x - 1 >= 0 &&  !isTraversed(board.getIn([x - 1, y]))) res.push([x - 1, y, "N"]);
    if (y + 1 <= mY && !isTraversed(board.getIn([x, y + 1]))) res.push([x, y + 1, "E"])
    if (y - 1 >= 0 &&  !isTraversed(board.getIn([x, y - 1]))) res.push([x, y - 1, "W"]);
    return res;    
}

function isTraversed(cell) {
    return ["│", "─", "┌", "└", "┐", "┘", "█"].includes(cell);
}

function isFilled(board) {
    return board.flatMap(x => x).every(isTraversed);
}

function render(board) {
    return board.map(row => row.join("")).join("\n");
}

function getSymbol(direction) {
    switch (direction) {
        case "N":
        case "S":
            return "│"
        case "W":
        case "E":
            return "─";
        default:
            return "█";
    }
}

function getTurnSymbol(direction) {
    switch (direction) {
        case "WN": return "└";
        case "EN": return "┘";
        case "NW": return "┐";
        case "NE": return "┌";
        case "WS": return "┌";
        case "ES": return "┐";
        case "SW": return "┘";
        case "SE": return "└";
        default:
            return "█";
    }
}

function solve(initial, beginX, beginY, maxTurns) {
    const stack = [[initial, beginX, beginY, "", [], maxTurns + 1]];
    const results = [];
    let iterations = 0;
    while (stack.length > 0) {
        const [board, x, y, direction, moves, turns] = stack.pop();
        const updated = board.setIn([x, y], getSymbol(direction));
        iterations++;

        if (isFilled(updated)) {
            const usedTurns = maxTurns - turns;
            console.log(`T: ${usedTurns}`);
            console.log(render(updated));
            console.log("-".repeat(10));
            results.push([usedTurns, updated]);
            continue;
        }

        const directions = availableDirections(updated, x, y);
        for ([nextX, nextY, nextDirection] of directions) {
            const nextMove = [...moves, [nextX, nextY]];
            if (direction === nextDirection) {
                stack.push(List([updated, nextX, nextY, nextDirection, nextMove, turns]));
            } else if (turns >= 1) {
                const turned = updated.setIn([x, y], getTurnSymbol(direction + nextDirection));
                stack.push(List([turned, nextX, nextY, nextDirection, nextMove, turns - 1]));
            }
        }
    }
    return [iterations, results];
}

function main({ size, start, turns }) {
    const initialRow = Repeat(null, size).toList();
    const initial = Repeat(initialRow, size).toList();
    const t0 = performance.now();
    const [iterations, results] = solve(initial, start.x, start.y, turns);
    const elapsed = Math.round((performance.now() - t0));

    console.log();
    console.log(`Ran ${iterations} iterations in ${elapsed} ms`);
    console.log(`Found ${results.length} results!`);
    console.log();

    if (results.length) {
        results.sort((a, b) => a[0] - b[0]);
        const [[bestTurns, bestBoard]] = results;
        const [worstTurns, worstBoard] = results.pop();

        console.log(`Best: ${bestTurns} turns`);
        console.log(render(bestBoard));
        console.log();
        console.log(`Worst: ${worstTurns} turns`);
        console.log(render(worstBoard));
    }
    
}

main({ size: 5, start: { x: 3, y: 1}, turns: 12});