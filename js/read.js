//第一步：对图片分类    this._init()
//第二步：生成dom元素   this._createElement();
//第三步：绑定事件      this._bind()
//第四步：显示到页面上   this._show()

;(function (window, document) {
    const methods = {
        //涉及频繁操作dom插入元素，设置一个方法
        appendChild(parent, ...children) {
            //对象方法的简写，省略function
            children.forEach(el => {
                parent.appendChild(el)
            })
        },
        //设置一个选择器方法，选择一个元素，默认根目录是document。
        $(selector, root = document) {
            //对象方法的简写，省略function
            return root.querySelector(selector)
        },
        //设置一个选择器方法，选择多个元素
        $$(selector, root = document) {
            //对象方法的简写，省略function
            return root.querySelectorAll(selector)
        }
    };

    let Img = function (options) {
        this._init(options);
        this._createElement();
        this._bind();
        this._show();
    };

    //通过解构赋值拿到配置项
    Img.prototype._init = function ({data, initType, parasitifer}) {
        this.types = ['全部']; //所有的分类
        this.all = []; //所有图片元素
        this.classified = {全部: []}; //按照类型分类后的图片
        this.currentType = initType; //当前显示的图片分类
        this.parasitifer = methods.$(parasitifer); //挂载点
        //调用methods里定义的选择器方法把传入的选择器选出来

        this.imgContainer = null; //所有图片的html结构容器
        this.wrap = null; //整体容器
        this.typeBtnEls = null; //所有分类按钮组成的数组
        this.figures = null; //所有当前显示的图片组成的数组

        this._classify(data) //对图片进行分类
    };

    Img.prototype._classify = function (data) {
        let srcs = []; //定义一个空数组，用来存放图片地址

        data.forEach(({title, type, alt, src}, index) => {
            //对data数组每一项进行遍历
            //['全部','Javascript'] 添加了JavaScript的分类到所有分类数组中
            if (!this.types.includes(type)) {
                // 如果所有分类的数组中没有该data数据中的type
                this.types.push(type) //把没有的分类type添加到所有分类中
            }
            //如果按照类型分类对象中，没有该分类，就添加该对象的属性和值
            //{'全部':[],'Javascript':[]} 添加了JavaScript这个属性和空数组属性值
            if (!Object.keys(this.classified).includes(type)) {
                this.classified[type] = []
            }
            if (!srcs.includes(src)) {
                //存放图片的数组中没有data数据中的图片src，重复的图片不再放入
                // 图片没有生成过
                // 生成图片
                // 添加到 对应的分类
                srcs.push(src); //把存放图片数组中没有的图片存进去
                let figure = document.createElement('figure');
                let img = document.createElement('img');
                let figcaption = document.createElement('figcaption');

                img.src = src; //对创建的img标签添加图片地址
                img.setAttribute('alt', alt); //给创建的img标签设置alt属性值
                figcaption.innerText = title; //创建的figcaption添加文字

                methods.appendChild(figure, img, figcaption); //调用methods方法中的appendChild方法，给figcaption添加子元素img和figure

                this.all.push(figure); //将生成的不重复图片放到存放所以图片元素的this.all数组中
                // console.log(this.all) //figure是上面创建的一个图片结构，包括img和title,all数组中是全部的图片，data.js一共有9张不同的图片，所以打印出的this.all中也就共有9个figure

                //通过push方法将当前图片放进all数组中，然后对当前图片进行分类，push方法会放进数组中最后一个，所以在all中找图片的时候，获取最后一个即可，长度-1就是最后一个索引
                this.classified[type].push(this.all.length - 1)
            } else {
                // 去all中找到对应的图片
                // 添加到 对应的分类
                this.classified[type].push(srcs.findIndex(s1 => s1 === src)) //findIndex是一个方法：返回传入一个测试条件（函数）符合条件的数组第一个元素位置。
                // 判断当前src和srcs数组中图片地址是否相等，如果相等的就返回当前地址在srcs数组中的索引，添加到分类中。
            }
        })
    };

    //获取图片
    //第一种情况，全部，直接把all数组返回
    //第二种情况，不是全部，找对应的图片组成数组再返回
    Img.prototype._getImgsByType = function (type) {
        return type === '全部'
            ? [...this.all]
            : this.classified[type].map(index => this.all[index]) //分好类图片对象的下标对应全部图片的下标，this.classified[type].push(this.all.length - 1); 根据index找到在全部图片中对应的图片
    };

    //生成dom
    Img.prototype._createElement = function () {
        //创建分类按钮
        let typesBtn = []; //存放每个按钮的html字符串

        //对所有分类的数组进行遍历
        for (let type of this.types.values()) {
            typesBtn.push(
                `<li class="__Img__classify__type-btn ${
                    this.currentType === type ? '__Img__type-btn-active' : ''
                    }">${type}</li>`
            )
        }

        //整体模板
        let template = ` 
        <ul class="__Img__classify">
            ${typesBtn.join('')}
        </ul>
        <div class="__Img__img-container"></div>
        `;

        let wrap = document.createElement('div');
        wrap.className = `__Img__container`;
        wrap.innerHTML = template;

        this.imgContainer = methods.$('.__Img__img-container', wrap);

        //将分好为一类的所有图片放入到容器中
        methods.appendChild(
            this.imgContainer,
            ...this._getImgsByType(this.currentType)
        ); //this._getImgsByType(this.currentType)得到的是一个数组，而插入到html结构里的要是数组，需要将数组展开得到每一项，传入自定义的methods.appendChild()方法里的参数children，多个children可以用扩展运算符...又组合成数组进行遍历

        //将需要用到的元素挂载到this实例，以达到各个函数都可获取
        this.wrap = wrap;
        this.typeBtnEls = methods.$$('.__Img__classify__type-btn', wrap);
        this.figures = [...methods.$$('figure', wrap)]; //获取的是节点nodeList,不是数组，想要用数组的方法需要转成数组

        //遮罩层
        let overlay = document.createElement('div');
        overlay.className = '__Img__overlay';
        overlay.innerHTML = `<div class="__Img__overlay-prev-btn"></div>
                           <div class="__Img__overlay-next-btn"></div>
                           <img alt="" src="">`;
        methods.appendChild(this.wrap, overlay);
        this.overlay = overlay;
        this.previewImg = methods.$('img', overlay);

        this._calcPosition(this.figures);
    };

    //将当前显示的图片和点击按钮下一次要显示的图片进行遍历，如果当前显示图片与下一次要显示的图片一样，就将当前显示图片的那一张图的index与下一次要显示的那一张图的index放进数组，作为映射
    //当前显示[0 1 2 3] 下一次显示图片[2 6 3 8] 重复图片是2 3 重复图片的index映射[[2 0],[3 2]]
    Img.prototype._diff = function (prevsImgs, nextImgs) {
        let diffArr = [];

        //遍历上一次显示图片的src地址和每一张图片在数组的index位置，与下一次要显示的图片的src对比，src一样就是同一张图，将下一次显示的同一样图的index与上一次显示图片的index做映射
        prevsImgs.forEach((src1, index1) => {
            //当数组中的元素在测试条件时返回 true 时,findIndex() 返回符合条件的元素的索引位置，之后的值不会再调用执行函数。
            //如果没有符合条件的元素返回 -1
            let index2 = nextImgs.findIndex(src2 => src1 === src2);
            if (index2 !== -1) {
                diffArr.push([index1, index2])
            }
        });
        return diffArr
    };

    //绑定事件
    Img.prototype._bind = function () {
        //   methods.$('.__Img__classify', this.wrap).addEventListener('click', e => {
        //     // 代理li元素
        //     if (e.target.nodeName !== 'LI') return;
        //     //nodeName需要大写
        //     else {
        //       console.log(e.target.innerText);
        //       console.log(e.target.nodeName); //LI e.target 指向触发事件监听的对象,即li
        //       console.log(e.currentTarget.nodeName); //UL e.currentTarget指向的是给绑定事件监听的那个对象，即ul
        //     }
        //   })

        //对li的父元素ul绑定事件，事件代理
        methods
            .$('.__Img__classify', this.wrap)
            .addEventListener('click', ({target}) => { //只有当函数参数是对象而且有target属性才解构成功
                //事件对象event具有target属性，target解构event对象得到的
                if (target.nodeName !== 'LI') return;

                //点击按钮获得显示的图片类型
                const type = target.innerText;
                const els = this._getImgsByType(type);

                console.log(this.figures);

                //比对当前显示图片和下一次要显示的图片是否一样(比对图片src可确定图片是否一样)
                let prevImgs = this.figures.map(figure => methods.$('img', figure).src); //当前显示的图片this.figures的html结构内包含着img标签，要获取img标签的src属性

                let nextImgs = els.map(figure => methods.$('img', figure).src); //下一次显示的图片els里有根据分类获取类型返回的this.all[分类数组数字],里面是下次要显示图片的html结构内包含着img标签，要获取img标签的src属性

                const diffArr = this._diff(prevImgs, nextImgs);

                //拿到重复显示图片映射后的数组，获取到下一次要显示并且重复图片的下标
                diffArr.forEach(([, i2]) => {
                    this.figures.every((figure, index) => {
                        //对当前显示图片每一项进行遍历，每一项都符合遍历的函数就返回true，其中有一项不符合返回false
                        let src = methods.$('img', figure).src;

                        if (src === nextImgs[i2]) {
                            //如果当前显示图片的src等于下一次显示图片的src
                            this.figures.splice(index, 1); //当前显示图片的数组裁减掉同一张图片的src
                            return false //every方法遇到false会停止
                        }
                        return true
                    })
                });

                this._calcPosition(els);

                let needAppendEls = [];
                if (diffArr.length) {
                    let nextElsIndex = diffArr.map(([, i2]) => i2)

                    els.forEach((figure, index) => {
                        if (!nextElsIndex.includes(index)) {
                            needAppendEls.push(figure)
                        }
                    })
                } else {
                    needAppendEls = els
                }

                //隐藏元素
                this.figures.forEach(el => {
                    el.style.transform = `scale(0,0) translate(0%,100%)`;
                    el.style.opacity = '0'
                });

                //添加新元素
                methods.appendChild(this.imgContainer, ...needAppendEls);

                setTimeout(() => {
                    els.forEach(el => {
                        el.style.transform = `scale(1,1) translate(0,0)`;
                        el.style.opacity = '1'
                    });
                });

                setTimeout(() => {
                    this.figures.forEach(figure => {
                        this.imgContainer.removeChild(figure)
                    });

                    this.figures = els
                }, 600)
            })
    };

    //显示元素
    //第一步：将图片的html结构放到指定的容器中
    //第二步设置图片的css样式改变scale和opacity使图片显示(原本css样式scale(0,0) opacity:0)
    Img.prototype._show = function () {
        methods.appendChild(this.parasitifer, this.wrap);

        //添加定时器达到异步使图片有动画效果
        setTimeout(() => {
            this.figures.forEach(figure => {
                figure.style.transform = 'scale(1,1) translate(0,0)';
                figure.style.opacity = '1'
            })
        })
    };

    //图片叠加在一起的原因：
    //1.根据style.css中可知图片是根据this.imgContainer绝对定位，当没有设置left和top值时，全部都叠放在左上角
    //2.图片绝对定位的时候会脱离文档流，this.imgContainer出现高度塌陷。根据图片个数修改图片容器this.imgContainer的高度
    //计算每张图片的left和top值只需要知道每张图片是第几行第几张。假如第二行第三张图片：top值就是1*图片的高度+1*行间距，left值就是2*图片的宽度＋2*列间距

    //top值的计算使用index是因为行数是不确定的，可能有三行或者多行，这时候top值要根据有几行去计算高度，所以需要用所有图片的索引index。而left值的计算用horizontalImgIndex是因为确定一行有4张图片，每一列图片的left定位是固定的，所以用定义的horizontalImgIndex列索引即可。
    //计算每一张图片的绝对定位的left和top值，设置容器的高度
    Img.prototype._calcPosition = function (figures) {
        let horizontalImgIndex = 0; //表示当前行数的第几张图片

        //这里的figures将传入所有当前显示的图片组成的数组this.figures
        figures.forEach((figure, index) => {
            //计算每一张图片绝对定位的top值，140是图片的高度，15是图片间的间隙
            figure.style.top =
                parseInt(index / 4) * 140 + parseInt(index / 4) * 15 + 'px';
            //计算图片的行数：第几张图/4再取整+1 parseInt(index/4)+1
            //计算每一张图片绝对定位的left值，240是图片的宽度，15是图片间的间隙
            figure.style.left =
                horizontalImgIndex * 240 + horizontalImgIndex * 15 + 'px';

            figure.style.transform = 'scale(0,0) translate(0,-100%)';

            //如果一行铺满4张就换下一行，第0张
            //如果不换行，horizontalIndex+1
            horizontalImgIndex = (horizontalImgIndex + 1) % 4
            //horizontalImgIndex=horizontalImgIndex>=3?0:++horizontalImgIndex;
        });

        //判断当前显示图片张数分多少行排布
        let len = Math.ceil(figures.length / 4); //向上取整
        //根据图片行数设置图片容器的高度
        this.imgContainer.style.height = len * 140 + (len - 1) * 15 + 'px'
    };

    //把插件Img挂在全局$Img暴露给全局，可以直接在全局下new $Img调用插件
    window.$Img = Img
})(window, document);
//window和document传参或者不传参都是可以的，都能获取到。
//如果传参的话可能会提高一些程序效率，例如，如果使用document的话，当前作用域中没有，就会沿着作用域链一级一级向上找，直到找到为止，如果传入参数的话，会直接使用传入的参数。

//<ul>
// <li>1</li>
// <li>2</li>
// </ul>
// ul.addEventListener('click',function(e){e.currentTarget//ul e.target//li})
//e.target指向引发触发事件的元素。e.target可以用来实现事件委托，该原理是通过事件冒泡（或者事件捕获）给父元素添加事件监听，如上述的例子中，e.target指向用户点击的li，由于事件冒泡，li的点击事件冒泡到了ul上，通过给ul添加监听事件而达到了给每一个li添加监听事件的效果
//e.currentTarget 指向添加监听事件的对象。

// horizontalImgIndex = (horizontalImgIndex + 1) % 4
//可用以下替代
//horizontalImgIndex=horizontalImgIndex>=3?0:++horizontalImgIndex;
//++在后，是先输出horizontalImgIndex的值再加1，但是horizontalImgIndex接收的是horizontalImgIndex++计算的值，并不是horizontalImgIndex值本身，所以输出的一直0，图片也都定位在了第一个位置，一行的图片重叠了。
