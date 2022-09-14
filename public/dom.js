window.$ = {
    one: (...args) => window.top.document.querySelector(...args),
    all: (...args) => window.top.document.querySelectorAll(...args),
    on: (dom, eventName, func) => dom.addEventListener(eventName, func),
    off: (dom, eventName, func) => dom.removeEventListener(eventName, func),
    make: (domString) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = domString;
        return wrapper.firstElementChild;
    },
    attr: (dom, attr, value) => {
        attr = attr.toString();
        if (typeof value == "undefined") {
            return dom.getAttribute(attr);
        }
        dom.setAttribute(attr, value.toString());
    },
    find: (dom, ...args) => dom.querySelector(...args),
    css: (dom, attr, value) => {
        attr = attr.toString();
        if (typeof value == "undefined") {
            return window.getComputedStyle(dom)[attr];
        }
        dom.style[attr] = value.toString();
    },
    prop: (dom, prop) => window.getComputedStyle(dom).getPropertyValue(prop),
    pos: (dom) => {
        return {
            top: dom.offsetTop,
            left: dom.offsetLeft,
        };
    },
};
