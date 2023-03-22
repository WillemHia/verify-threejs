# install

npm install verify-threejs

# usage
## 我们需要将路径为**node_modules/three/examples/fonts/droid/droid_sans_mono_regular.typeface.json**的字体文件拷贝到项目的**public/fonts/** 目录下，public中没有fonts文件夹的可以新建一个。
```html
<div id="verify" style="opacity: 0;"></div>
```

```javascript
import verify from 'verify-threejs'
verify(
    document.querySelector('#verify'), {
        sizeRatio: 3,
        theme: 'dark,',
        insideColor: '#fff',
        outsideColor: '#000',
        success: () => {
            alert('验证成功')
        },
    }
)
```

# demo
https://svarsity.cn:9999
