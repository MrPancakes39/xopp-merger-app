window.$ = {
    one: (...args) => window.top.document.querySelector(...args),
    all: (...args) => window.top.document.querySelectorAll(...args),
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
};

window.onload = function () {
    for (let i = 1; i <= 20; i++) {
        addToList(`File ${i}`);
    }
};

function addToList(name, uuid) {
    const container = $.one("#file-container");

    // Create the file dom and append it to body
    uuid = uuid ?? name;
    let fileElt = $.make(`
    <div class="file" data-hold="false" data-uuid="${uuid.toString()}">
        <span class="reorder no-select">menu</span>
        <span class="name">${name.toString()}</span>
        <span class="remove no-select">close</span>
    </div>
    `);
    container.appendChild(fileElt);

    // increase number of files
    let listLen = +$.attr(container, "data-files");
    $.attr(container, "data-files", listLen + 1);
}
