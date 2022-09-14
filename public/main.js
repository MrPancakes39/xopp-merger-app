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

    // setup events for that item
    setupListItemEvent(fileElt);
}

function setupListItemEvent(fileDom) {
    $.on($.find(fileDom, ".reorder"), "pointerdown", (e) => {
        e.preventDefault();
        $.on(document, "pointermove", onPointermove);
        $.on(document, "pointerup", onPointerup);
        setMoveStyle(fileDom, true);
    });

    function onPointerup() {
        $.off(document, "pointermove", onPointermove);
        $.off(document, "pointerup", onPointerup);
        setMoveStyle(fileDom, false);
    }

    function onPointermove() {}

    function setMoveStyle(elt, should) {
        if (should) {
            let pos = $.pos(elt);
            $.css(elt, "position", "absolute");
            $.css(elt, "top", `${pos.top}px`);
            $.css(elt, "left", `${pos.left}px`);
            $.attr(elt, "data-hold", "true");
        } else {
            $.css(elt, "position", "relative");
            $.css(elt, "top", "");
            $.css(elt, "left", "");
            $.attr(elt, "data-hold", "false");
        }
    }
}
