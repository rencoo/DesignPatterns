// 懒加载原理
// 将资源路径赋值到img标签的data-xx属性中，而非直接赋值在src属性
// 持续判断图片是否在用户当前窗口的可视范围内，从而动态将data-xx的值(url)赋值到src里去

// 图片懒加载类
class LazyLoad {
    constructor(selector) {
        this.imglis = Array.from(document.querySelectorAll(selector));
        this.init(); // 初始化
    }

    // 判断图片是否需要加载
    load() {
        let imglis = this.imglis;
        for (let i = imglis.length; i--;) {
            if(this.canSeen(imglis[i])) {
                this.show(imglis[i]);
                this.del(i);
            }
        }
    }   

    // 判断图片是否在浏览器可视范围内
    canSeen(el) {
        let bound = el.getBoundingClientRect();  // 元素相对于视窗的位置集合；有top, right, bottom, left等等属性
        let clientHeight = window.innerHeight;
        return bound.top <= clientHeight - 200;  // 为了看效果，加懒加载的图片提前
    }

    // 显示图片
    show(el) {
        let src =el.getAttribute('data-src');
        el.src = src;
    }

    // 移除imglis里面已经加载的图片(避免重复判断,减少开销)
    del(idx) {
        this.imglis.splice(idx, 1);                   
    }

    // 当浏览器滚动的时候，继续判断(持续运行load)
    bindEvent() {
        window.addEventListener('scroll', ()=>{
            this.load();
        })
    }

    // 初始化
    init() { 
        this.load();
        this.bindEvent();
    }
}

// 实例化对象(以懒加载的图片类为选择参数)
const lazy = new LazyLoad('.lazyload');
