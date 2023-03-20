import * as THREE from 'three';
import { DragControls } from 'three/addons/controls/DragControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/fontloader'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import gsap from 'gsap'




function verify(
    verifyBody,{
    sizeRatio,
    theme,
    insideColor,
    outsideColor,
    success
}) {
    
    let camera, scene, renderer, intersects, oldPosition, oldRotation,
        wordSet, animateTime = 0.5, rightCircle, leftCircle, dragControls, tip,
        wordContainer, resetCloseContainer, lodingContainer;
    let renderNeeded = false, isAnimating = false, rightWord = 0;
    const objects = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    normalization();
    const sizes = {
        width: 1536 / sizeRatio,
        height: 745.6 / sizeRatio
    }

    const verifyBodyStyle = {
        fontFamily: 'Inter, Avenir, Helvetica, Arial, sans-serif',
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`,
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0000004d',
        zIndex: '999',
        opacity: 1,
        pointerEvents: 'auto',
        transition: 'opacity 0.2s ease-in-out'
    }
    Object.assign(verifyBody.style, verifyBodyStyle);

    const verifyContainer = verifyBody.appendChild(document.createElement('div'));
    verifyContainer.id = 'verifyContainer';
    const style = {
        width: `${sizes.width}px`,
        height: `${sizes.height}px`,
        position: 'relative',
        display: 'none',
        boxShadow: '0 1px 3px #0000004d',
        borderRadius: '5px',
        overflow: 'hidden',
        background: theme === 'dark' ? '#000' : '#fff',
    }
    Object.assign(verifyContainer.style, style);

    const verifyFlash = verifyContainer.appendChild(document.createElement('div'));
    verifyFlash.id = 'verifyFlash';
    const flashStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '8%',
        height: '100%',
        backgroundColor: `rgba(255,255,255,${theme === 'dark' ? 0.1 : 0.2})`,
        zIndex: 1,
        transform: `translateX(-${sizes.width / 3.5}px) skew(-30deg)`,
        transition: 'transform 0.6s ease-in-out'
    }
    Object.assign(verifyFlash.style, flashStyle);
    init();
    animate();
    loding();

    // 初始化,创建场景,相机,渲染器,光源,文字,拖拽控制器...
    function init() {
        camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 1, 5000);
        camera.position.z = 1000;

        scene = new THREE.Scene();

        scene.add(new THREE.AmbientLight(0x505050));

        const light = new THREE.SpotLight(0xffffff, 1.5);
        light.position.set(0, 500, 2000);
        light.angle = Math.PI / 8;

        light.castShadow = true;
        light.shadow.camera.near = 1000;
        light.shadow.camera.far = 4000;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        scene.add(light);

        const fontCount = 10
        wordSet = randChar(fontCount)
        const loader = new FontLoader();

        loader.load('fonts/droid_sans_mono_regular.typeface.json', function (font) {
            wordSet.forEach((word, i) => {
                const textGeometry = new TextGeometry(word, {
                    font: font,
                    size: 50,
                    height: 3.25,
                    curveSegments: 32,
                    bevelEnabled: true,
                    bevelThickness: 10,
                    bevelSize: 8,
                    bevelSegments: 16
                });

                const material = new THREE.MeshStandardMaterial({ color: (1 - Math.random() * 0.7) * 0xffffff, transparent: true, metalness: 0, roughness: 0.7 });

                const mesh = new THREE.Mesh(textGeometry, material);

                mesh.content = word;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.position.x = 400 * Math.cos(2 * Math.PI * (Math.random() - 0.5));
                mesh.position.y = 300 * Math.sin(2 * Math.PI * (Math.random() - 0.5));
                mesh.position.z = Math.random() * 800 - 400;

                mesh.rotation.x = (Math.random() - 0.5) * 0.6 * Math.PI;
                mesh.rotation.y = (Math.random() - 0.5) * 0.6 * Math.PI;
                mesh.rotation.z = (Math.random() - 0.5) * 0.6 * Math.PI;

                const scaleRandom = Math.random() * 2 + 2;
                mesh.scale.x = scaleRandom;
                mesh.scale.y = scaleRandom;
                mesh.scale.z = scaleRandom;

                // 将几何体的中心点作为旋转点
                textGeometry.center();

                scene.add(mesh);
                objects.push(mesh);
            })

            for (let i = 0; i < 10; i++) {

                const object = new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshStandardMaterial({ color: (1 - Math.random() * 0.7) * 0xffffff, metalness: 0.5, roughness: 0.5 }));

                object.position.x = 400 * Math.cos(2 * Math.PI * (Math.random() - 0.5));
                object.position.y = 300 * Math.sin(2 * Math.PI * (Math.random() - 0.5));
                object.position.z = Math.random() * 800 - 400;

                object.rotation.x = Math.random() * 2 * Math.PI;
                object.rotation.y = Math.random() * 2 * Math.PI;
                object.rotation.z = Math.random() * 2 * Math.PI;

                object.scale.x = Math.random() * 2 + 2;
                object.scale.y = Math.random() * 2 + 2;
                object.scale.z = Math.random() * 2 + 2;

                object.castShadow = true;
                object.receiveShadow = true;

                scene.add(object);

                objects.push(object);

            }

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            verifyContainer.appendChild(renderer.domElement);
            renderer.domElement.style.position = 'absolute';
            renderer.domElement.style.top = '0px';
            renderer.domElement.style.left = '0px';

            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(sizes.width, sizes.height);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;
            dragControls = new DragControls([...objects], camera, renderer.domElement);
            dragControls.addEventListener('drag', function (e) {
                renderNeeded = true;
            });
            dragControls.addEventListener('dragend', function (e) {
                renderNeeded = true;
                dragEnd(e);
            });
            dragControls.addEventListener('dragstart', function (e) {
                renderNeeded = true;
                oldPosition = e.object.position.clone();
                oldRotation = e.object.rotation.clone();
                resetCloseContainer.style.opacity = 0;
                resetCloseContainer.style.pointerEvents = 'none';

            });
            const circleGeometry = new THREE.CircleGeometry(430, 64);
            const circleMaterial = new THREE.MeshStandardMaterial({ opacity: 0, transparent: true });
            rightCircle = new THREE.Mesh(circleGeometry, circleMaterial);
            leftCircle = new THREE.Mesh(circleGeometry, circleMaterial);
            rightCircle.position.z = -401;
            rightCircle.position.y = -500;
            rightCircle.position.x = 1500;
            leftCircle.position.z = -401;
            leftCircle.position.y = -500;
            leftCircle.position.x = -1500;

            rightCircle.receiveShadow = true;
            scene.add(rightCircle, leftCircle);
            generateGalaxy();
            createTip();
            createResetAndClose();
            renderer.render(scene, camera);
            lodingContainer.style.display = 'none';
            verifyContainer.style.display = 'block';
            window.addEventListener('resize', onWindowResize);
            renderer.domElement.addEventListener('pointermove', onPointerMove);
        });

    }

    // 鼠标移动时，更新鼠标位置
    function onPointerMove(event) {

        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        pointer.x = (event.offsetX / sizes.width) * 2 - 1;
        pointer.y = - (event.offsetY / sizes.height) * 2 + 1;
    }

    // 窗口大小改变时，重新设置容器大小
    function onWindowResize() {
        const width = window.innerWidth
        const height = window.innerHeight
        verifyBody.style.width = `${width}px`
        verifyBody.style.height = `${height}px`
    }
    
    // 渲染函数
    function render() {

        renderer.render(scene, camera);
        if (!isAnimating) {
            raycaster.setFromCamera(pointer, camera);
            intersects = raycaster.intersectObjects(scene.children.filter((item) => item.type === 'Mesh'));
        }
    }

    // 使用requestAnimationFrame循环调用渲染函数
    function animate() {
        requestAnimationFrame(animate);
        if (renderNeeded || isAnimating) { // 只在需要时重新渲染场景
            render();
            renderNeeded = false; // 重新渲染后，将标记设置为false
        }
    }

    //生成随机字母或数字
    function randChar(length, characters = "bcdefghijnqrstvyABCDEFGHIJKLNOPQRSTUWXY123456789") {
        //length为所需长度，characters为所包含的所有字符，默认为字母+数字。
        characters = characters.split("");//分割字符。
        let result = new Set()//返回的结果。
        while (result.size < length) result.add(characters[Math.floor(Math.random() * characters.length)]);//随机取出一个字符。
        return result;
    }

    //验证字母或数字是否正确
    function verify(intersects, obj) {
        //判断最低层是否是验证框
        const len = intersects.length;
        const isRightWord = obj.content && Array.from(wordSet).indexOf(obj.content) > -1 && Array.from(wordSet).indexOf(obj.content) <= 3;
        if (len != 0) {
            if (objects.indexOf(intersects[len - 1].object) === -1) {
                if (isRightWord) {
                    return 1; //验证成功
                } else if (len === 1 && isRightWord) {
                    return 1; //验证成功,矫正防止移动太快出现bug
                } else {
                    return 0; //验证失败,返回原来的位置
                }
            } else {
                return -1; //最低层不是验证框
            }
        } else {
            return -1; //最低层不是验证框
        }
    }

    //拖拽结束后的回调函数
    function dragEnd(e) {
        const uuArray = [];
        resetCloseContainer.style.opacity = 1;
        resetCloseContainer.style.pointerEvents = 'auto';
        if (intersects.length > 1) {//确保intersects中没有重复的元素
            for (let i = 0; i < intersects.length; i++) {
                if (uuArray.indexOf(intersects[i].object.uuid) === -1) {
                    uuArray.push(intersects[i].object.uuid);
                } else {
                    intersects.splice(i, 1);
                    i--;
                }
            }
        }
        const result = verify(intersects, e.object)

        if (result === 0) {
            isAnimating = true;  //启动动画
            gsap.to(e.object.position, {
                x: oldPosition.x,
                y: oldPosition.y,
                z: oldPosition.z,
                ease: "power1.inOut",
                duration: animateTime
            });
            gsap.to(e.object.rotation, {
                x: oldRotation.x + Math.PI * 2,
                y: oldRotation.y + Math.PI * 2,
                z: oldRotation.z + Math.PI * 2,
                ease: "power1.inOut",
                duration: animateTime
            });
            animateEnd(animateTime * 1.2)

        } else if (result === 1) {
            const textMesh = e.object
            const endPosition = {}
            if (intersects.length >= 2) {
                if (intersects[1].object.uuid === rightCircle.uuid) {
                    endPosition.x = rightCircle.position.x
                    endPosition.y = rightCircle.position.y
                    endPosition.z = rightCircle.position.z - 10
                } else {
                    endPosition.x = leftCircle.position.x
                    endPosition.y = leftCircle.position.y
                    endPosition.z = leftCircle.position.z - 10
                }
            }
            isAnimating = true;  //启动动画
            gsap.to(textMesh.rotation, {
                x: oldRotation.x + Math.PI * 4,
                y: oldRotation.y + Math.PI * 4,
                ease: "power1.inOut",
                duration: animateTime
            })
            gsap.to(textMesh.position, {
                x: endPosition.x,
                y: endPosition.y,
                z: endPosition.z - 10,
                ease: "power1.inOut",
                duration: animateTime
            })
            gsap.to(textMesh.material, {
                opacity: 0,
                ease: "power1.in",
                duration: animateTime
            })
            const promise = animateEnd(animateTime * 1.2)

            // 动画结束后,场景中删除e.object
            promise.then(() => {
                textMesh.material.dispose();
                textMesh.geometry.dispose();
                scene.remove(textMesh)
                rightWord++
                if (rightWord === 4) {
                    verifyContainer.querySelector('#verifyFlash').style.transform = `translateX(${sizes.width * 1.2}px) skew(-30deg)`
                    setTimeout(() => {
                        closeContainer()
                        success()
                    }, 600)
                }
            })


            const text = textMesh.content
            wordContainer.childNodes.forEach((item, index) => {
                if (item.innerText === text) {
                    item.style.opacity = 0
                    item.style.transform = 'scale(0.5,0.5)'
                    item.style.transform = 'translateY(15px)'
                }
            })

        }
        
    }

    //3D对象动画结束
    function animateEnd(animateTime = 0.5) {
        //写一个primise
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                isAnimating = false;
                resolve();
            }, animateTime * 1000)
        })
    }


    //创建星空验证框
    function generateGalaxy() {
        const parameters = {}
        parameters.count = 10000
        parameters.size = 0.01
        parameters.radius = 5
        parameters.branches = 4
        parameters.spin = 1.2
        parameters.randomness = theme === 'dark' ? 0.2 : 0.15
        parameters.randomnessPower = 2
        parameters.insideColor = insideColor
        parameters.outsideColor = outsideColor
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(parameters.count * 3)
        const colors = new Float32Array(parameters.count * 3)
        const colorInside = new THREE.Color(parameters.insideColor)
        const colorOutside = new THREE.Color(parameters.outsideColor)
        for (let i = 0; i < parameters.count; i++) {
            let i3 = i * 3

            const radius = Math.random() * parameters.radius
            const spinAngle = radius * parameters.spin
            const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2

            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * parameters.randomness * parameters.radius * (Math.random() < 0.5 ? 1 : -1)
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * parameters.randomness * parameters.radius * (Math.random() < 0.5 ? 1 : -1)

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
            positions[i3 + 1] = Math.sin(branchAngle + spinAngle) * radius + randomY
            positions[i3 + 2] = 0

            const mixedColor = colorInside.clone()
            mixedColor.lerp(colorOutside, radius / parameters.radius)

            colors[i3] = mixedColor.r
            colors[i3 + 1] = mixedColor.g
            colors[i3 + 2] = mixedColor.b

        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const material = new THREE.PointsMaterial({
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        })

        const rightPoints = new THREE.Points(geometry, material)
        const leftPoints = new THREE.Points(geometry, material)
        const scale = rightCircle.geometry.parameters.radius / parameters.radius
        rightPoints.scale.set(scale, scale, scale)
        rightPoints.position.x = rightCircle.position.x
        rightPoints.position.y = rightCircle.position.y
        rightPoints.position.z = rightCircle.position.z
        leftPoints.scale.set(scale, scale, scale)
        leftPoints.position.x = leftCircle.position.x
        leftPoints.position.y = leftCircle.position.y
        leftPoints.position.z = leftCircle.position.z
        scene.add(rightPoints, leftPoints)

        scene.add(rightPoints)
    }

    //创建提示信息以及验证字母或数字
    function createTip() {
        tip = document.createElement('div');
        const tipStyles = {
            position: 'absolute',
            top: '0',
            left: '0',
            color: theme === 'dark' ? '#fff' : '#000',
            fontSize: `${sizeRatio > 2 ? (32 / sizeRatio) : 16}px`,
            fontWeight: 'bold',
            pointerEvents: 'none',
            padding: '0 5px',
        };
        Object.assign(tip.style, tipStyles);
        tip.innerHTML = '请将下面字母或数字拖入验证框';
        verifyContainer.appendChild(tip);
        wordContainer = document.createElement('div');
        tip.appendChild(wordContainer);

        //在tip中创建多个span标签，用来显示正确的字母或数字,在下一行显示
        for (let i = 0; i < 4; i++) {
            const word = document.createElement('div');
            const wordColor = objects[i].material.color;
            const wordStyles = {
                display: 'inline-block',
                width: `${25 / (sizeRatio * 0.5)}px`,
                height: `${25 / (sizeRatio * 0.5)}px`,
                lineHeight: `${25 / (sizeRatio * 0.5)}px`,
                textAlign: 'center',
                fontSize: `${24 / (sizeRatio > 2 ? 1.5 : 1)}px`,
                fontWeight: 'bolder',
                margin: '0 5px',
                color: `rgb(${wordColor.r * 255},${wordColor.g * 255},${wordColor.b * 255})`,
                opacity: '1',
                transform: 'translateY(0)',
                transition: 'all 0.5s',
            }
            Object.assign(word.style, wordStyles);
            word.innerHTML = Array.from(wordSet)[i];
            wordContainer.appendChild(word);
        }
    }

    //创建重置和关闭按钮
    function createResetAndClose() {
        resetCloseContainer = document.createElement('div');
        const resetCloseContainerStyles = {
            position: 'absolute',
            top: '0',
            right: '0',
            width: '10%',
            height: '10%',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            transition: 'all 0.5s'
        }
        Object.assign(resetCloseContainer.style, resetCloseContainerStyles);
        verifyContainer.appendChild(resetCloseContainer);
        const reset = document.createElement('div');
        const resetColseStyles = {
            display: 'inline-block',
            width: '50%',
            height: '50%',
            color: theme === 'dark' ? '#fff' : '#000',
        }
        Object.assign(reset.style, resetColseStyles);
        reset.innerHTML = `<svg t="1679107276429" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3719" height="100%"><path d="M591.963942 6.17051C409.548578-22.304204 233.4705 49.707042 121.688176 182.211672l-3.617789-81.387966a59.065957 59.065957 0 0 0-61.625482-56.4326A59.065957 59.065957 0 0 0 0.061527 106.016588l9.610523 216.365983a59.065957 59.065957 0 0 0 61.625482 56.383378l216.365983-9.610524a59.065957 59.065957 0 0 0 56.346462-61.613176 59.065957 59.065957 0 0 0-61.588566-56.420294l-66.793752 2.965603c84.242821-97.05275 213.941818-150.445914 349.067499-132.52924 227.908456 30.234387 382.341322 250.279687 333.193524 474.853376-45.160846 206.373992-246.243513 341.290482-455.607719 302.909915a393.071637 393.071637 0 0 1-278.680568-206.263243 58.942903 58.942903 0 0 0-78.237782-25.533721 59.065957 59.065957 0 0 0-26.395099 80.428145c70.411543 135.359484 200.319732 237.925057 362.012788 267.568784 274.287537 50.218369 537.561734-128.210043 593.600561-399.901138C1073.536071 329.765815 880.34117 51.183691 591.963942 6.17051z" p-id="3720" fill="${resetColseStyles.color}"></path></svg>`;
        resetCloseContainer.appendChild(reset);
        const close = document.createElement('div');
        Object.assign(close.style, resetColseStyles);
        close.innerHTML = `<svg t="1679107472685" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3103"   height="100%"><path d="M925.468404 822.294069 622.19831 512.00614l303.311027-310.331931c34.682917-27.842115 38.299281-75.80243 8.121981-107.216907-30.135344-31.369452-82.733283-34.259268-117.408013-6.463202L512.000512 399.25724 207.776695 87.993077c-34.675754-27.796066-87.272669-24.90625-117.408013 6.463202-30.178323 31.414477-26.560936 79.375815 8.121981 107.216907l303.311027 310.331931L98.531596 822.294069c-34.724873 27.820626-38.341237 75.846432-8.117888 107.195418 30.135344 31.43699 82.72919 34.326806 117.408013 6.485715l304.178791-311.219137 304.177767 311.219137c34.678824 27.841092 87.271646 24.951275 117.408013-6.485715C963.808618 898.140501 960.146205 850.113671 925.468404 822.294069z" fill="${resetColseStyles.color}" p-id="3104"></path></svg>`;
        resetCloseContainer.appendChild(close);
        const svgStyles = {
            cursor: 'pointer'
        }
        resetCloseContainer.querySelectorAll('svg').forEach((svg, i) => {
            Object.assign(svg.style, svgStyles);
            if (i === 0) {
                svg.addEventListener('click', () => {
                    resetPosition();
                })
            } else {
                svg.addEventListener('click', () => {
                    closeContainer();
                })
            }
        })
    }

    //点击事件重置的回调函数
    function resetPosition() {
        isAnimating = true;
        objects.forEach((object, i) => {
            gsap.to(object.position, {
                duration: animateTime,
                x: 0,
                y: 0,
                z: 0,
                ease: 'power1 inOut'
            })
            gsap.to(object.rotation, {
                duration: animateTime,
                z: Math.PI * 2 + object.rotation.z,
                x: Math.PI * 2 + object.rotation.x,
                y: Math.PI * 2 + object.rotation.y,
                ease: 'power1 inOut'
            })

        })
        animateEnd(animateTime).then(() => {
            isAnimating = true;
            objects.forEach((object, i) => {
                object.position.set(0, 0, 0);
                object.rotation.set(0, 0, 0);

                const positionX = 400 * Math.cos(2 * Math.PI * (Math.random() - 0.5));
                const positionY = 300 * Math.sin(2 * Math.PI * (Math.random() - 0.5));
                const positionZ = Math.random() * 800 - 400;

                const rotationX = (Math.random() - 0.5) * 0.6 * Math.PI;
                const rotationY = (Math.random() - 0.5) * 0.6 * Math.PI;
                const rotationZ = (Math.random() - 0.5) * 0.6 * Math.PI;

                gsap.to(object.position, {
                    duration: animateTime,
                    x: positionX,
                    y: positionY,
                    z: positionZ,
                    ease: 'power1 inOut',
                })
                gsap.to(object.rotation, {
                    duration: animateTime,
                    x: rotationX + Math.PI * 2,
                    y: rotationY + Math.PI * 2,
                    z: rotationZ + Math.PI * 2,
                    ease: 'power1 inOut',
                })
            })
            animateEnd(animateTime * 1.2)
        })
    }

    //点击事件关闭的回调函数
    function closeContainer() {
        verifyBody.removeChild(verifyBody.querySelector('#verifyContainer'));
        verifyBody.style.pointerEvents = 'none';
        verifyBody.style.opacity = 0;
    }

    //加载动画
    function loding() {
        lodingContainer = document.querySelector('#lodingContainer')
        if (lodingContainer) {
            lodingContainer.style.display = 'flex';
        } else {
            lodingContainer = document.createElement('div');
            lodingContainer.id = 'lodingContainer';
            lodingContainer.innerHTML = `<div></div><div></div><div></div>`;
            const lodingContainerStyles = {
                width: `32px`,
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                justifyContent: 'space-between',
            }
            const keyframes = `@keyframes verifyLoding {
            from {
                opacity: 1;
              }
              to {
                opacity: 0;
              }
          }`;
            Object.assign(lodingContainer.style, lodingContainerStyles);
            if(document.styleSheets.length === 0) document.head.appendChild(document.createElement('style'));
            const styleSheet = document.styleSheets[0];
            styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
            verifyBody.appendChild(lodingContainer);
            lodingContainer.childNodes.forEach((div, i) => {
                const divStyles = {
                    width: `8px`,
                    height: `8px`,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    animation: 'verifyLoding 0.4s ease-in-out alternate infinite',
                    animationDelay: `${i * 0.1}s`
                }
                Object.assign(div.style, divStyles);
            })
        }
    }

    //参数标准化
    function normalization() {
        let temp
        //判断verifyBody是否是一个dom元素
        if (!(verifyBody instanceof HTMLElement)) {
            //报错
            throw new Error('first parameter is not a dom element');
        }

        if (typeof sizeRatio !== 'number' || isNaN(sizeRatio) || sizeRatio < 1 || sizeRatio > 4) {
            temp = sizeRatio;
            sizeRatio = 3;
            if (temp !== undefined) console.warn('sizeRatio is not a right number, the default value is 3');
        }

        if (typeof success !== 'function') {
            //报错
            throw new Error('success is not a function');
        }
        if (theme !== 'dark' && theme !== 'light') {
            temp = theme;
            theme = 'dark';
            if (temp !== undefined) console.warn('theme is not a right theme, the default value is dark');
        }
        //判断颜色是否正确
        if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(insideColor)) {
            temp = insideColor;
            insideColor = theme === 'dark' ? '#47463f' : '#bf007e';
            if (temp !== undefined) console.warn('insideColor is not a right color, the default value is ' + insideColor);
        }
        if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(outsideColor)) {
            temp = outsideColor;
            outsideColor = theme === 'dark' ? '#1b1b21' : '#5f97c4';
            if (temp !== undefined) console.warn('outsideColor is not a right color, the default value is ' + outsideColor);
        }
    }
}

module.exports = verify;