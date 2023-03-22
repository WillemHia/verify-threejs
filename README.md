# install

npm install verify-threejs

# usage

我们需要将路径为**node_modules/three/examples/fonts/droid/droid_sans_mono_regular.typeface.json**的字体文件拷贝到项目的**public/fonts/** 目录下，public中没有fonts文件夹的可以新建一个。

```html
<div id="verify" style="opacity: 0;"></div>
<button id="btn">Click Me</button>
```

```javascript
import verify from "verify-threejs";

document.querySelector('#btn').addEventListener('click', () => {
    verify(
        document.querySelector('#verify'), {
            success: () => {
                alert('验证成功')
            },
        }
    );
})
```

参数

```javascript
 {
     sizeRatio: 3, //缩放比率，用来调节大小，非必填，默认值为3，值为1-4
     theme: 'dark,', //主题，非必填，默认值为dark，值为dark或light
     insideColor: '#fff', //验证星空内颜色，非必填，在主题为dark时默认值为#47463f,否则默认值为#bf007e，值为16进制的颜色
     outsideColor: '#000', //验证星空外颜色，非必填，在主题为dark时默认值为#1b1b21，否则默认值为#5f97c4，值为16进制的颜色
     success: () => { //成功之后的回调函数，必填项，值为函数
         alert('验证成功')
     }
 }
```

# demo

https://svarsity.cn:9999
