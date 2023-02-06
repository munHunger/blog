
function checkHorizontal(ctx: { scene: Array<Array<{ type: string }>>, x: number, y: number }, type: Array<string>, depth = 99, strict: boolean = false) {
    let offset = 1
    let count = 0

    if (!strict)
        type.push("interactive") //since this is a wildcard it should be valid
    while (type.includes(((ctx.scene[ctx.x + offset] || [])[ctx.y] || {}).type) && offset <= depth) {
        count++
        offset++
    }
    offset = -1
    while (type.includes(((ctx.scene[ctx.x + offset] || [])[ctx.y] || {}).type) && -offset <= depth) {
        count++
        offset--
    }
    console.log(`checked for ${type} at ${ctx.x}:${ctx.y}, found ${count}`)
    return count
}

export abstract class Entity {
    constructor(public x: number, public y: number) {
    }
    abstract isInvalid(scene: Array<Array<{ type: string }>>): boolean
    abstract name: string
}

export class Box extends Entity {
    name = 'box'
    isInvalid(scene: { type: string; }[][]): boolean {
        return checkHorizontal({ scene, x: this.x, y: this.y }, ['conveyor'], 1) < 1
    }
}

export class Conveyor extends Entity {
    name = 'conveyor'
    isInvalid(scene: { type: string; }[][]): boolean {
        return checkHorizontal({ scene, x: this.x, y: this.y }, ['box', 'conveyor', 'conveyor-start'], 1) !== 2 ||
            (checkHorizontal({ scene, x: this.x, y: this.y }, ['conveyor-start'], 1, true) >= 2)
    }
}

export class ConveyorStart extends Entity {
    name = 'conveyor-start'
    isInvalid(scene: { type: string; }[][]): boolean {
        return checkHorizontal({ scene, x: this.x, y: this.y }, ['conveyor'], 1) < 1
    }
}

export class Floor extends Entity {
    name = 'floor'
    isInvalid(scene: { type: string }[][]): boolean {
        return false
    }
} 