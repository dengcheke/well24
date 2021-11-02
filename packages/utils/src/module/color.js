const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.height = 1;
canvas.width = 128;

export function genColorRamp(stops, w, h) {
    if(!(stops instanceof Array)) return stops;
    canvas.height = parseInt(h) || 1;
    canvas.width = parseInt(w) || 128;
    stops = [...stops].sort((a, b) => a.value - b.value);
    if (!stops.length) throw new Error('invalid color ramps');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    for (let i = 0; i < stops.length; i++) {
        gradient.addColorStop(stops[i].value, stops[i].color);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('png');
    canvas.width = 1;
    canvas.height = 128;
    return data;
}
