<template>
    <div style="display: flex;">
        <new-custom-scrollbar style="height: 800px;width: 50%" @scroll="handleScroll">
            <!--<div v-for="i in 100" style="height: 40px;width:1000px;
        background: linear-gradient(to right,dodgerblue,cadetblue);
        box-sizing:border-box;
        border: 1px solid red">itemitemitemitemitemitem,,,{{i}}</div>-->
            {{str1}}
        </new-custom-scrollbar>
        <div style="height: 800px;width: 50%;overflow:auto;" ref="div2">
            <!--<div v-for="i in 100" style="height: 40px;width:1000px;
        background: linear-gradient(to right,dodgerblue,cadetblue);
        box-sizing:border-box;
        border: 1px solid cyan">itemitemitemitemitemitem,,,{{i}}</div>-->
            {{str1}}
        </div>
    </div>

</template>

<script>
import NewCustomScrollbar from "../../../src/packages/new-custom-scrollbar";
export default {
    name: "_new_scrollbar",
    components: {NewCustomScrollbar},
    data(){
        return {
            str1:"跳到主要内容\n" +
                "跳到搜索\n" +
                "跳过选择语言\n" +
                "技术\n" +
                "参考和指南\n" +
                "回馈\n" +
                "搜索 MDN\n" +
                "面向开发人员的 Web 技术\n" +
                "网络 API\n" +
                "文档\n" +
                "文档：keydown 事件\n" +
                "改变语言\n" +
                "目录\n" +
                "文档：keydown 事件\n" +
                "\n" +
                "keydown按下某个键时会触发该事件。\n" +
                "\n" +
                "与keypress事件不同的keydown是，无论它们是否产生字符值，都会为所有键触发事件。\n" +
                "\n" +
                "气泡\n" +
                "是的\n" +
                "\n" +
                "\n" +
                "可取消\n" +
                "是的\n" +
                "\n" +
                "\n" +
                "界面\n" +
                "KeyboardEvent\n" +
                "\n" +
                "\n" +
                "事件处理程序属性\n" +
                "onkeydown\n" +
                "\n" +
                "和事件提供一个代码keydown，keyup指示按下了哪个键，而keypress指示输入了哪个字符。例如，小写字母“a”将由keydownand报告为 65 keyup，但由 97报告keypress。所有事件都将大写“A”报告为 65。\n" +
                "\n" +
                "例子\n" +
                "addEventListener keydown 示例\n" +
                "\n" +
                "此示例KeyboardEvent.code在您按下某个键时记录该值。\n" +
                "\n" +
                "<p>Focus the IFrame first (e.g. by clicking in it), then try pressing some keys.</p>\n" +
                "<p id=\"log\"></p>\n" +
                "\n" +
                "复制到剪贴板\n" +
                "const log = document.getElementById('log');\n" +
                "\n" +
                "document.addEventListener('keydown', logKey);\n" +
                "\n" +
                "function logKey(e) {\n" +
                "  log.textContent += ` ${e.code}`;\n" +
                "}\n" +
                "\n" +
                "复制到剪贴板\n" +
                "onkeydown 等效项\n" +
                "document.onkeydown = logKey;\n" +
                "\n" +
                "复制到剪贴板\n" +
                "在 IME 合成期间忽略 keydown\n" +
                "\n" +
                "输入法编辑器 (IME)是一个程序，它使用户能够使用其他组合键输入键盘不支持的字符。\n" +
                "\n" +
                "从 Firefox 65 开始，现在在 IME 组合期间会触发keydownand事件（keyup错误 354358）。要忽略keydown作为合成一部分的所有事件，请执行以下操作（229 是为keyCode与已由 IME 处理的事件相关的事件设置的特殊值）：\n" +
                "\n" +
                "eventTarget.addEventListener(\"keydown\", event => {\n" +
                "  if (event.isComposing || event.keyCode === 229) {\n" +
                "    return;\n" +
                "  }\n" +
                "  // do something\n" +
                "});\n" +
                "\n" +
                "复制到剪贴板\n" +
                "规格\n" +
                "规格\n" +
                "UI 事件# event-type-keydown\n" +
                "\n" +
                "浏览器兼容性\n" +
                "在 GitHub 上报告此兼容性数据的问题\n" +
                "keydown 事件\n" +
                "铬合金\n" +
                "全力支持\n" +
                "1\n" +
                "边缘\n" +
                "全力支持\n" +
                "12\n" +
                "火狐\n" +
                "全力支持\n" +
                "14\n" +
                "IE浏览器\n" +
                "全力支持\n" +
                "9\n" +
                "歌剧\n" +
                "全力支持\n" +
                "11.6\n" +
                "苹果浏览器\n" +
                "全力支持\n" +
                "2\n" +
                "WebView 安卓\n" +
                "全力支持\n" +
                "1\n" +
                "铬安卓\n" +
                "全力支持\n" +
                "18\n" +
                "火狐安卓版\n" +
                "全力支持\n" +
                "14\n" +
                "歌剧安卓\n" +
                "全力支持\n" +
                "12\n" +
                "iOS 上的 Safari\n" +
                "全力支持\n" +
                "1\n" +
                "三星互联网\n" +
                "全力支持\n" +
                "1.0\n" +
                "传奇\n" +
                "全力支持\n" +
                "全力支持\n" +
                "也可以看看\n" +
                "keypress\n" +
                "keyup\n" +
                "Element:keydown事件\n" +
                "发现此页面有问题？\n" +
                "在GitHub 上编辑\n" +
                "来源在GitHub\n" +
                "在GitHub 上报告此内容的问题\n" +
                "想自己解决问题吗？请参阅我们的贡献指南。\n" +
                "\n" +
                "上一次更改： 2021 年 10 月 26 日,由 MDN 贡献者提供\n" +
                "\n" +
                "更改您的语言\n" +
                "选择您的首选语言\n" +
                "英语（美国）\n" +
                "西班牙文\n" +
                "日本语\n" +
                "한국어\n" +
                "葡萄牙语（巴西）\n" +
                " 改变语言\n" +
                "相关话题\n" +
                "Document\n" +
                "构造函数\n" +
                "Document()\n" +
                "特性\n" +
                "activeElement\n" +
                "alinkColor\n" +
                "all\n" +
                "anchors\n" +
                "applets\n" +
                "bgColor\n" +
                "body\n" +
                "characterSet\n" +
                "childElementCount\n" +
                "children\n" +
                "compatMode\n" +
                "contentType\n" +
                "currentScript\n" +
                "defaultView\n" +
                "designMode\n" +
                "dir\n" +
                "doctype\n" +
                "documentElement\n" +
                "documentURI\n" +
                "domain\n" +
                "embeds\n" +
                "fgColor\n" +
                "firstElementChild\n" +
                "forms\n" +
                "fullscreen\n" +
                "fullscreenElement\n" +
                "fullscreenEnabled\n" +
                "head\n" +
                "height\n" +
                "hidden\n" +
                "images\n" +
                "implementation\n" +
                "lastElementChild\n" +
                "lastModified\n" +
                "lastStyleSheetSet\n" +
                "linkColor\n" +
                "links\n" +
                "location\n" +
                "mozSyntheticDocument\n" +
                "onafterscriptexecute\n" +
                "onbeforescriptexecute\n" +
                "onfullscreenchange\n" +
                "onfullscreenerror\n" +
                "onoffline\n" +
                "ononline\n" +
                "onvisibilitychange\n" +
                "origin\n" +
                "pictureInPictureElement\n" +
                "pictureInPictureEnabled\n" +
                "plugins\n" +
                "pointerLockElement\n" +
                "preferredStyleSheetSet\n" +
                "readyState\n" +
                "referrer\n" +
                "rootElement\n" +
                "scripts\n" +
                "scrollingElement\n" +
                "selectedStyleSheetSet\n" +
                "styleSheets\n" +
                "styleSheetSets\n" +
                "timeline\n" +
                "title\n" +
                "URL\n" +
                "visibilityState\n" +
                "vlinkColor\n" +
                "width\n" +
                "xmlEncoding\n" +
                "xmlVersion\n" +
                "方法\n" +
                "adoptNode()\n" +
                "append()\n" +
                "caretPositionFromPoint()\n" +
                "caretRangeFromPoint()\n" +
                "clear()\n" +
                "close()\n" +
                "createAttribute()\n" +
                "createCDATASection()\n" +
                "createComment()\n" +
                "createDocumentFragment()\n" +
                "createElement()\n" +
                "createElementNS()\n" +
                "createEntityReference()\n" +
                "createEvent()\n" +
                "createExpression()\n" +
                "createNodeIterator()\n" +
                "createNSResolver()\n" +
                "createProcessingInstruction()\n" +
                "createRange()\n" +
                "createTextNode()\n" +
                "createTouch()\n" +
                "createTouchList()\n" +
                "createTreeWalker()\n" +
                "elementFromPoint()\n" +
                "elementsFromPoint()\n" +
                "enableStyleSheetsForSet()\n" +
                "evaluate()\n" +
                "execCommand()\n" +
                "exitFullscreen()\n" +
                "exitPictureInPicture()\n" +
                "exitPointerLock()\n" +
                "getAnimations()\n" +
                "getBoxObjectFor()\n" +
                "getElementById()\n" +
                "getElementsByClassName()\n" +
                "getElementsByName()\n" +
                "getElementsByTagName()\n" +
                "getElementsByTagNameNS()\n" +
                "getSelection()\n" +
                "hasFocus()\n" +
                "hasStorageAccess()\n" +
                "importNode()\n" +
                "mozSetImageElement()\n" +
                "open()\n" +
                "prepend()\n" +
                "queryCommandEnabled()\n" +
                "queryCommandSupported()\n" +
                "querySelector()\n" +
                "querySelectorAll()\n" +
                "registerElement()\n" +
                "releaseCapture()\n" +
                "replaceChildren()\n" +
                "requestStorageAccess()\n" +
                "write()\n" +
                "writeln()\n" +
                "活动\n" +
                "animationcancel\n" +
                "animationend\n" +
                "animationiteration\n" +
                "animationstart\n" +
                "copy\n" +
                "cut\n" +
                "DOMContentLoaded\n" +
                "drag\n" +
                "dragend\n" +
                "dragenter\n" +
                "dragleave\n" +
                "dragover\n" +
                "dragstart\n" +
                "drop\n" +
                "fullscreenchange\n" +
                "fullscreenerror\n" +
                "gotpointercapture\n" +
                "keydown\n" +
                "keypress\n" +
                "keyup\n" +
                "lostpointercapture\n" +
                "paste\n" +
                "pointercancel\n" +
                "pointerdown\n" +
                "pointerenter\n" +
                "pointerleave\n" +
                "pointerlockchange\n" +
                "pointerlockerror\n" +
                "pointermove\n" +
                "pointerout\n" +
                "pointerover\n" +
                "pointerup\n" +
                "readystatechange\n" +
                "scroll\n" +
                "selectionchange\n" +
                "selectstart\n" +
                "touchcancel\n" +
                "touchend\n" +
                "touchmove\n" +
                "touchstart\n" +
                "transitioncancel\n" +
                "transitionend\n" +
                "transitionrun\n" +
                "transitionstart\n" +
                "visibilitychange\n" +
                "wheel\n" +
                "遗产：\n" +
                "Node\n" +
                "EventTarget\n" +
                "网络技术\n" +
                "学习网页开发\n" +
                "关于 MDN\n" +
                "回馈\n" +
                "关于\n" +
                "MDN 网络文档商店\n" +
                "联系我们\n" +
                "火狐\n" +
                "MDN\n" +
                "推特上的 MDN\n" +
                "Github 上的 MDN\n" +
                "Mozilla\n" +
                "Mozilla 在推特上\n" +
                "Instagram 上的 Mozilla\n" +
                "\n" +
                "© 2005-2022 Mozilla和个人贡献者。内容在这些许可下可用。\n" +
                "\n" +
                "条款\n" +
                "隐私\n" +
                "饼干"
        }
    },
    methods:{
        handleScroll({left,top}){
            //console.log(left,top)
            //this.$refs.div2.scrollLeft = left;
            //this.$refs.div2.scrollTop = top;
        }
    }
}
</script>

<style scoped>

</style>
