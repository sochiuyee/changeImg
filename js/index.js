// 第一步：对图片分类    this._init()
// 第二步：生成dom元素   this._createElement();
// 第三步：绑定事件      this._bind()
// 第四步：显示到页面上   this._show()

;(function (window, document) {
    //允许切换标志位
    let canChange = true;

    //上一张图片的index
    let currentPreviewIndex = 0;

    // 公共方法
    const methods = {

        // 自定义给父元素添加子元素的方法
        appendChild(parent, ...children) {
            children.forEach(el => {
                parent.appendChild(el)
            });
        },

        // 自定义选择一个元素的选择器方法，默认根目录是document
        $(selector, root = document) {
            return root.querySelector(selector);
        },

        // 自定义选择多个元素的选择器方法，默认根目录是document
        $$(selector, root) {
            return root.querySelectorAll(selector);
        },
    };

    let Img = function (options) {

        //初始化，对图片进行分类
        this._init(options);

        //生成dom元素
        this._createElement();

        //绑定事件
        this._bind();

        //显示到页面上
        this._show();
    };

    //定义初始化函数
    Img.prototype._init = function ({data, initType, parasitifer}) { //通过对象解构赋值拿到配置项

        this.types = ['全部']; // 所有种类的类型
        this.all = []; // 显示的所有图片元素
        this.classified = {'全部': []}; // 把所有图片分类，并且记录图片在所有图片元素数组中的下标位置
        this.currentType = initType; // 当前显示的图片的种类
        this.parasitifer = methods.$(parasitifer); // 挂载内容的地方

        this.imgContainer = null; //所有图片的容器

        this.wrap = null; //装按钮和图片的容器
        this.typeBtnEls = null; // 所有按钮组成的数组
        this.figures = null; //所有当前显示图片组成的数组

        // 对图片进行分类
        this._classify(data);


    };

    //定义图片分类函数
    Img.prototype._classify = function (data) {
        //思路: this.classified对象是对应this.all中图片根据类型，数组记录this.all图片的下标
        //假设this.all中所有的图片 [类型1图片,类型2图片,类型3图片,类型2图片,类型1图片]
        //this.classified={"类型1":[0,4],"类型2":[1,3],"类型3":[2]} 数组记录this.all中图片的下标

        let srcs = []; //存放图片地址

        data.forEach(({type, title, alt, src}) => {

            // 判断data数据中的种类type是否在保存所有种类的数组中已有
            if (!this.types.includes(type)) {
                //添加新的种类
                this.types.push(type);
            }

            // 判断图片分类对象中是否有data数据中的种类type
            if (!Object.keys(this.classified).includes(type)) {
                //添加新的种类，并设置属性值
                this.classified[type] = [];
            }

            // 判断图片是否生成过
            // 思路: 判断图片是否生成过，就可以将图片src与存放图片地址中的src作对比，src一样证明图片已生成过，无需再生成
            if (!srcs.includes(src)) {
                // 图片没有生成过: 生成图片 添加到对应的分类

                srcs.push(src); //将没有生成过的图片地址保存

                //生成一张图片的html元素
                let figure = document.createElement('figure');
                let img = document.createElement('img');
                let figcaption = document.createElement('figcaption');

                //填充一张图片的标签内容
                img.src = src;
                img.setAttribute('alt', alt);
                figcaption.innerText = title;

                //一张图片的html结构
                methods.appendChild(figure, img, figcaption);

                //把生成的图片结构放到所以图片数组this.all中保存
                this.all.push(figure);

                //保存对应图片的下标值
                //思路: 因为this.all保存每一张图片的html结构时，用push方法会把内容放到数组的最后一项，获取对应的下标应该是this.all长度-1就是最后一项的下标值
                this.classified[type].push(this.all.length - 1);


            } else {
                // 图片已生成过: 获取保存图片地址的数组中的src，与data数据的src对比一致表明已经生成过图片，找到srcs该生成过图片的地址的下标，存放到分类对象的数组中
                this.classified[type].push(srcs.findIndex(s1 => s1 === src))
            }
        });


    };

    //根据分类获取图片
    Img.prototype._getImgsByType = function (type) {
        //第一张情况:全部图片 直接获取保存所有图片的this.all
        //第二种情况:特定某一类 获取分类好对象的某类数组，根据数组保存的下标找到对应的所有图片数组中对应下标的图片
        return type === '全部' ? [...this.all] : this.classified[type].map(index => this.all[index])
    };


    //定义生成dom元素函数
    Img.prototype._createElement = function () {
        //创建分类按钮

        let typesBtn = [];

        //遍历保存所有种类的数组
        for (let type of this.types.values()) {
            typesBtn.push(`<li class="__Img__classify__type-btn ${this.currentType === type ? '__Img__type-btn-active' : ''}">${type}</li>`);
        }

        // 整体模板(按钮html结构和图片容器结构)
        let template = `
        <ul class="__Img__classify">
            ${typesBtn.join('')}
        </ul>
        <div class="__Img__img-container"></div>`;

        //存放按钮和图片的容器
        let wrap = document.createElement('div');
        wrap.className = `__Img__container`;
        wrap.innerHTML = template;

        //选择出存放图片的容器
        this.imgContainer = methods.$('.__Img__img-container', wrap);

        //将获取到的图片放进图片容器中
        methods.appendChild(this.imgContainer, ...this._getImgsByType(this.currentType));

        //保存到实例上方便其他函数获取
        this.wrap = wrap;

        //获取所有的按钮 querySelector获取到的节点，需要转成数组遍历
        this.typeBtnEls = [...methods.$$('.__Img__classify__type-btn', wrap)];

        //获取所有显示在页面的图片(querySelector获取到图片节点nodeList,需要转成数组才能遍历)
        this.figures = [...methods.$$('figure', wrap)];


        //遮罩层
        let overlay = document.createElement('div');
        overlay.className = '__Img__overlay';
        overlay.innerHTML = `<div class="__Img__overlay-prev-btn"></div>
                           <div class="__Img__overlay-next-btn"></div>
                           <img alt="" src="">`;

        methods.appendChild(this.wrap, overlay);
        this.overlay = overlay;

        //获取遮罩层里显示的图片
        this.previewImg = methods.$('img', overlay);

        this._calcPosition(this.figures);

    };

    //比较两个分类是否有重复的图片,拿到重复图片位置映射
    Img.prototype._diff = function (prev, next) {
        //思路: 第一次显示图片[3,8,5,4,2] 下一次要显示图片[5,4,9,2,3]  重复图片位置index的映射[[0,4],[3,1],[2,0],[4,3]]

        let diffArr = []; //保存两次显示同一张图片在两种分类中位置的映射

        prev.forEach((src1, index1) => {
            //上一次图片与下一次图片的src比较，相等就获取下一次显示图片中该项的下标
            let index2 = next.findIndex(src2 => src2 === src1);

            //找到两次要显示的图片一样
            if (index2 !== -1) {
                diffArr.push([index1, index2]);
            }
        });

        return diffArr;
    };

    //定义绑定事件函数
    Img.prototype._bind = function () {
        //事件代理 代理li
        methods.$('.__Img__classify', this.wrap).addEventListener('click', ({target}) => { //解构赋值获取event.target
            if (target.nodeName !== 'LI') return;

            if (!canChange) return;
            canChange = false; //动画没有完毕，不允许切换

            const type = target.innerText;

            //根据点击按钮类型获取对应类型的图片html结构
            const els = this._getImgsByType(type);

            //获取当前显示图片的src,并组成数组
            let prevImgs = this.figures.map(figure => methods.$('img', figure).src); //当前显示的图片this.figures的html结构内包含着img标签，要获取img标签的src属性

            //获取点击按钮后准备要显示的图片src
            let nextImgs = els.map(figure => methods.$('img', figure).src);

            //获取重复图片的位置映射
            const diffArr = this._diff(prevImgs, nextImgs);

            //对当前显示图片中有重复图片删去
            diffArr.forEach(([, i2]) => { //获取映射中下一次显示图片的index

                //对当前显示图片每一项遍历
                this.figures.every((figure, index) => {
                    //获取当前显示的每一张图片src
                    let src = methods.$('img', figure).src;

                    //如果当前图片与下一张图片重复，就在当前显示图片数组中去掉重复的图片(html结构上仍然有重复图片结构)
                    if (src === nextImgs[i2]) {
                        this.figures.splice(index, 1);
                        return false; //every方法碰到false就停止对this.figures遍历
                    }
                    return true; //没有重复图片返回true继续对this.figures的项遍历
                });
            });

            //计算下一次要显示图片的位置
            this._calcPosition(els);

            //思路：两次显示中，当前显示图片中有与下一次重复图片的话，不隐藏，下次显示中有与当前图片重复的图片需要筛选出来不再重新添加到页面上

            let needAppendEls = []; //保存两次显示中不重复的图片

            //如果有重复显示的图片
            if (diffArr.length) { //当没有重复图片length为0，转成布尔值为false
                // 获取相同显示图片中在下一次显示图片数组中的下标
                let nextElsIndex = diffArr.map(([, i2]) => i2);

                //在下一次显示图片数组中，将没有重复显示图片的下标放进needAppendEls中
                els.forEach((figure, index) => {

                    //对于下一次显示图片中，存放不与上一次显示重复的图片
                    if (!nextElsIndex.includes(index)) {
                        needAppendEls.push(figure);
                    }
                });
            } else {
                //两次显示不存在重复的图片
                needAppendEls = els;
            }

            this.figures.forEach(el => {
                //将当前显示的所有图片隐藏
                el.style.transform = 'scale(0,0) translate(0%,100%)';
                el.style.opacity = '0';
            });

            //下一次显示不重复图片添加到图片容器中
            methods.appendChild(this.imgContainer, ...needAppendEls);

            //将下一次图片显示的所有图片都显示出来(包括重复和不重复的照片)
            setTimeout(() => {
                els.forEach(el => {
                    el.style.transform = 'scale(1,1) translate(0,0)';
                    el.style.opacity = '1';
                });
            });


            //下一次图片显示就要销毁当前显示的图片
            setTimeout(() => {
                this.figures.forEach(figure => {
                    //移除不重复图片的html结构
                    this.imgContainer.removeChild(figure);
                });

                //将当前显示图片数组重现赋值为下一次要显示的图片
                this.figures = els;

                canChange = true; //动画完毕允许切换

            }, 600); //600ms是根据style.css中动画的时间定的

            //激活按钮
            this.typeBtnEls.forEach(btn => (btn.className = '__Img__classify__type-btn'));
            target.className = '__Img__classify__type-btn __Img__type-btn-active';
        });

        //图片的预览
        this.imgContainer.addEventListener('click', ({target}) => {
            if (target.nodeName !== 'FIGURE' && target.nodeName !== 'FIGCAPTION') return;

            //当点击的是figcaption时，因为figcaption和img是同级，需要将event.target转为它们的父元素figure才能获取它的子元素img的src
            if (target.nodeName === 'FIGCAPTION') {
                target = target.parentNode;
            }

            //当前点击图片的src
            const src = methods.$('img', target).src;

            //获取当前点击图片在当前显示图片中的下标
            currentPreviewIndex = this.figures.findIndex(figure => src === methods.$('img', figure).src);

            //在_createElement里定义的遮罩层图片this.previewImg
            this.previewImg.src = src;

            this.overlay.style.display = 'flex';

            setTimeout(() => {
                this.overlay.style.opacity = '1';
            });
        });

        //遮罩层的隐藏
        this.overlay.addEventListener('click', () => {
            this.overlay.style.opacity = '0';

            //解决遮罩层占据在页面上不能实现点击按钮情况
            setTimeout(() => {
                this.overlay.style.display = 'none';
            }, 300); //在css样式中遮罩层动画时间是300ms
        });

        methods.$('.__Img__overlay-prev-btn', this.overlay).addEventListener('click', e => {
            //阻止点击事件向上冒泡到遮罩层导致遮罩层隐藏
            e.stopPropagation();

            //循环切换
            currentPreviewIndex = currentPreviewIndex === 0 ? this.figures.length - 1 : --currentPreviewIndex;
            this.previewImg.src = methods.$('img', this.figures[currentPreviewIndex]).src;


        });
        methods.$('.__Img__overlay-next-btn', this.overlay).addEventListener('click', e => {
            //阻止点击事件向上冒泡到遮罩层导致遮罩层隐藏
            e.stopPropagation();

            //循环切换
            currentPreviewIndex = currentPreviewIndex === this.figures.length - 1 ? 0 : ++currentPreviewIndex;
            this.previewImg.src = methods.$('img', this.figures[currentPreviewIndex]).src;
        });

    };

    //定义计算图片位置函数
    Img.prototype._calcPosition = function (figures) { //获取当前显示在页面的图片
        //思路：图片是根据图片容器this.imgContainer绝对定位，每张图片的位置left值和top值根据图片的第几行第几张而定。图片定位脱离文档流导致图片容器高度塌陷，根据图片有几行去定义图片容器的高度

        //一行当中第几张图片
        let horizontalIndex = 0;

        //index为所有显示在页面图片中第几张图片
        //图片行数(index/4)+1
        figures.forEach((figure, index) => {

            //top值:(行数-1)*图片高度+(行数-1)*行间距
            figure.style.top = parseInt(index / 4) * 140 + parseInt(index / 4) * 15 + 'px';

            //left值:一行中第几张图*图片宽度+一行中第几张图*列间距
            figure.style.left = horizontalIndex * 240 + horizontalIndex * 15 + 'px';
            //图片特效更生动
            figure.style.transform = 'scale(0,0) translate(0,-100%)';

            //值为0-3 一行显示4张图
            horizontalIndex = (horizontalIndex + 1) % 4;

        });

        //总共当前显示图片的行数
        let len = (figures.length / 4) + 1;

        //根据当前显示图片行数设置图片容器的高度
        this.imgContainer.style.height = len * 140 + (len - 1) * 15 + 'px';

    };


    //定义显示到页面上函数
    Img.prototype._show = function () {
        //把按钮和图片内容挂载到用户选择的挂载点上
        methods.appendChild(this.parasitifer, this.wrap);

        //添加定时器达到异步使图片有动画效果
        setTimeout(() => {
            //对显示在页面的图片进行遍历
            this.figures.forEach(figure => {
                //改变style.css样式中设置缩放和透明度使图片显示
                figure.style.transform = 'scale(1,1) translate(0,0)';
                figure.style.opacity = '1';
            });
        });
    };

    window.$Img = Img;
})(window, document);//传参的话可能会提高一些程序效率，例如要使用document的话，当前作用域中没有，就会沿着作用域链一级一级向上找，直到找到为止，如果传入参数的话，会直接使用传入的参数。

