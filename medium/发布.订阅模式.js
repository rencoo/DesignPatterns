//发布者
var pub = {};
pub.publish = function () {
    agent.notify();
}

//订阅者
var sub1 = {};
sub1.update = function () {
    console.log('sub1收到');
}
var sub2 = {};
sub2.update = function () {
    console.log('sub2收到');
}
var sub3 = {};
sub3.update = function () {
    console.log('sub3收到');
}

//中介者
var agent = {};
agent.subs = [sub1, sub2, sub3];
agent.notify = function () {
    agent.subs.forEach(sub => {
        sub.update();
    });
}

agent.notify();