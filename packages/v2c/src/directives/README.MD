###vClickOutside
```vue
<template>
    <div v-click-outside="value"/>
</template>
```
value:Function

###vResize
缩放
```vue
<template>
    <div v-resize="options"/>
</template>
```
options: Boolean | Object | Function;<br>
=== false, 不生效<br>
= Object, 见下表<br>
= Function, 等价于{onResize:func}<br>
= 其他值, 等价于取下表默认值<br>

| 参数        | 说明              | 类型    | 可选值/说明 | 默认值      |
| ---------- | ----------------- | ------ | ----- | ---------- |
| resizableClass  | 可拖拽时的 class | String | -- | v-resizable |
| draggedClass  | 鼠标按下时的 class | String | -- | v-dragged |
| resizingClass  | 缩放时的 class | String | -- | v-resizing |
| directions  | 可拖拽缩放的方向 | Array | ['top', 'bottom', 'left', 'right'] | ['bottom', 'right'] |
| zoneSize  | 识别区域大小 | Number | -- | 4 |
| onResize  | 缩放时的回调 | Funtion | params: {direction,target,event} | -- |

###vTransferDom
移动到node下
```vue
<template>
    <div v-transfer-dom="node"/>
</template>
```
node:
* node为 falsy(undefined, null, '' , false) 值则不移动,
* node为 true 则目标为document.body
* node为 string, 则调用css selector,（若找不到节点则不移动）
* node为 window.HTMLElement, 则目标为node
* 其他值 不移动

###vLoading
遮罩
```vue
<template >
    <div v-loading="options"/>
</template>
```
options:

=Object

| 参数        | 说明              | 类型    | 可选值/说明 | 默认值      |
| ---------- | ----------------- | ------ | ----- | ---------- |
| show  | 是否显示遮罩 | Boolean | -- | true |
| content  | 自定义内容, 函数支持返回vnode | String / Function(h) | -- |  |
| boxClass  | 遮罩内容盒子自定义class | String | -- |  |
    
=== false, 不显示
= 其他值, 等价于Object默认值


###vMouseWheel
```vue
<template>
    <div v-mouse-wheel.modifiers="value"/>
</template>
```
modifiers: passive / capture,

value: Function
