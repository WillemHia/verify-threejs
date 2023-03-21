# install
npm install verify-threejs

# usage
verify(
        document.querySelector('#verify'),
        {
            sizeRatio: 3,
            theme: 'dark,',
            insideColor: '#fff',
            outsideColor: '#000',
            success: () => {
                alert('验证成功')
            },
        }
    )
