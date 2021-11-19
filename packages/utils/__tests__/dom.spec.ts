import {addClass, getScrollbarWidth, getStyle, hasClass, on, removeClass} from "../src";
const div = document.createElement('div');
const style = document.createElement('style');
style.innerHTML = `
    .class-a {
        width:100px;
        height:100px;
    }
    .class-b{
        color:red;
    }
`
document.body.appendChild(div);
document.head.appendChild(style);

test("event listener", () => {
    let time = 0;
    const remove = on(div, 'click', () => {
        time += 1;
    });
    div.click();
    expect(time).toEqual(1);
    expect(remove instanceof Function).toBeTruthy();
    if(remove instanceof Function) remove();
    expect(time).toEqual(1);
});

/*test('get scrollbar width', () => {
    expect(getScrollbarWidth()).toEqual(17);
})*/

test("style & class", () => {
    addClass(div, ['class-a', 'class-b']);
    expect(div.classList.contains('class-a')).toBeTruthy();
    expect(div.classList.contains('class-b')).toBeTruthy();
    expect(hasClass(div, "class-a")).toBeTruthy();
    expect(getStyle(div,'width')).toEqual('100px');

    removeClass(div, "class-a");
    expect(div.classList.contains('class-a')).toBeFalsy();
    expect(div.classList.contains('class-b')).toBeTruthy();
    expect(hasClass(div, "class-b")).toBeTruthy();
    expect(getStyle(div,'color')).toEqual('red');
});
