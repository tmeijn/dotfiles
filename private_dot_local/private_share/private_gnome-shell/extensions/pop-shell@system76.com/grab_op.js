import * as Movement from './movement.js';
export class GrabOp {
    constructor(entity, rect) {
        this.entity = entity;
        this.rect = rect;
    }
    operation(change) {
        return Movement.calculate(this.rect, change);
    }
}
