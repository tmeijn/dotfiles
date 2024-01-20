export const OK = 1;
export const ERR = 2;
export function Ok(value) {
    return { kind: 1, value: value };
}
export function Err(value) {
    return { kind: 2, value: value };
}
