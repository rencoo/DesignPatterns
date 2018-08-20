// 把图片抽象成一个行为，而不是封装成一个组件
var imgList = document.getElementById('list');
var imgs = document.querySelectorAll('ul img');

// 设置预览过程的方法，setPreviewBehavior
function setPreviewBehavior(subjects){
    var previewEvent = document.createEvent('Event');     // 第一个步骤，自定义的 DOM 事件(创建)
    // typeof typeof document.createEvent "function"
    previewEvent.initEvent('preview', true, true);        // 第二个步骤，初始化;initEvent()方法用于初始化通过DocumentEvent接口创建的Event的

    if(!Array.isArray(subjects)){
        if(subjects.length) subjects = Array.from(subjects);
        else subjects = [subjects];          
    }

    previewEvent.previewTargets = subjects.map(evt => evt.src);

    subjects.forEach(function(subject){
        subject.preview = function(){
            subject.dispatchEvent(previewEvent);
        }
    });
}
// 以上就是抽象行为的函数

// 把所有的imgs赋给行为
setPreviewBehavior(imgs);

var previewMask = document.getElementById('mask');
var previewImage = previewMask.querySelector('img');
var previewPrevious = previewMask.querySelector('.previous');
var previewNext = previewMask.querySelector('.next');

// 调用属于图片的 preview 方法，触发 preview 事件的
previewMask.onclick = function(evt) {
    if(evt.target === previewMask) {
        previewMask.style.display = 'none';
    }
}

imgList.addEventListener('click', function(evt){
    // 事件冒泡；发现事件主体它有evt方法的话，那就去调用preview方法，触发preview事件
    // 在preview事件里在去处理它；增加mask, 图片放到mask中心，初始化两个上下一张按钮
    if(evt.target.preview){
        evt.target.preview();
    }
})

imgList.addEventListener('preview', function(evt){
    var src = evt.target.src,
        imgs = evt.previewTargets;
    previewMask.style.display = 'block';
    previewImage.src = src;

    var idx = imgs.indexOf(src);

    function updateButton(idx){
        previewPrevious.style.display = idx ? 'block' : 'none';
        previewNext.style.display = idx < imgs.length - 1 ? 'block' : 'none';
    }

    updateButton(idx);

    previewPrevious.onclick = function(evt){
        previewImage.src = imgs[--idx];
        updateButton(idx);
    }

    previewNext.onclick = function(evt){
        previewImage.src = imgs[++idx];
        updateButton(idx);
    }
})


