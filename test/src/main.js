import {
    addIntersectListener,
    addResizeListener,
    clipImg,
    csvToJson,
    excelToJson,
    genColorRamp,
    jsonToExcel
} from '@well24/utils';
import axios from "axios";

async function test() {
    {
        const div = document.createElement('div');
        div.style.cssText = 'width:100px;height:100px;background-color:red;';
        document.body.append(div);
        addResizeListener(div, ({contentRect}) => {
            console.log(contentRect);
        })
        addIntersectListener(div, ({intersectionRect, intersectionRatio}) => {
            console.log(intersectionRect, intersectionRatio);
        });
    }
    {
        const img = document.createElement('img')
        document.body.append(img)
        await clipImg('/rhino.jpg',
            33, 71, 104, 124, {
                dstw: 87,
                dsth: 104
            }).then(str => {
            img.src = str
        })
    }
    {
        const img = document.createElement('img')
        document.body.append(img)
        img.src = genColorRamp([
            {offset: 0, color: 'red'},
            {offset: 0.5, color: 'green'},
            {offset: 1, color: 'blue'},
        ], 128, 32)
    }
    {
        const img = document.createElement('img')
        document.body.append(img)
        img.src = genColorRamp([
            {offset: 0, color: 'red'},
            {offset: 0.5, color: 'green'},
            {offset: 1, color: 'blue'},
        ], 128, 128,{
            linearType:"radial",
            gradientParam:[32,32,1,64,64,100]
        })
    }
    if (!true) {
        const {data} = await axios.get('/test.csv');
        const json = csvToJson(
            data,
            ',',
            {
                fields: 'id,geom,code,is_start,in001_7_in001,connect_loc'.split(','),
                keyMap: {
                    id: "哈哈",
                    in001_7_in001: "连接",
                },
                isFirstRowField: true
            }
        )
        console.log(json)
        await jsonToExcel(json);
    }
    {
        const input = document.createElement('input')
        document.body.append(input);
        input.type = 'file'
        input.onchange = (e) => {
            excelToJson(input.files[0]).then(data => {
                console.log("exceltojson", data)
            })
        }
    }
}

test()
