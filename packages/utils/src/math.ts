export function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number) {
    const m = 1 - t, m2 = (1 - t) ** 2, m3 = (1 - t) ** 3;
    const t2 = t ** 2, t3 = t ** 3;
    return p0 * m3 + 3 * p1 * m2 * t + 3 * p2 * m * t2 + p3 * t3;
}
