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
    setupListEltEvent(fileElt);
}

function setupListEltEvent(fileElt) {
    const container = $.one("#file-container");
    let placeholder;
    let prevY, currentY;

    $.on($.find(fileElt, ".reorder"), "pointerdown", (event) => {
        event.preventDefault();
        $.on(document, "pointermove", onPointermove);
        $.on(document, "pointerup", onPointerup);
        setMoveStyle(fileElt, true);

        placeholder = $.make(
            `<div id="placeholder" style='width: 100%; height: 50px;'>`
        );
        container.insertBefore(placeholder, fileElt);

        // initial Y position
        prevY = event.clientY;
    });

    function onPointerup() {
        $.off(document, "pointermove", onPointermove);
        $.off(document, "pointerup", onPointerup);
        setMoveStyle(fileElt, false);
        container.replaceChild(fileElt, placeholder);
    }

    function onPointermove(event) {
        currentY = event.clientY;

        let deltaY = currentY - prevY;
        prevY = currentY;

        moveElt(fileElt, deltaY);
    }

    function moveElt(elt, dist) {
        let eltY = $.pos(elt).top + dist;
        $.css(elt, "top", `${eltY}px`);
    }

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
