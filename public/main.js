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

const assert = (condition, ...data) => {
    if (condition) return;
    console.assert(condition, ...data);
    throw new Error("Assertion Failed!");
};

const FILE_LIST = [];

window.onload = function () {
    // if we upload via add sign
    const picker = $.one("#file_upload");

    $.on($.one("#file_add"), "click", (event) => {
        picker.click(event);
    });

    $.on(picker, "change", (event) => {
        [...event.target.files].forEach((file) => addFile(file));
    });

    // if we upload via drag and drop
    const container = $.one("#file-container");

    $.on(document.body, "dragover", (event) => {
        event.preventDefault();
        $.attr(container, "data-hover", "true");
    });

    ["dragend", "dragleave", "drop"].forEach((e) => {
        $.on(document.body, e, (event) => {
            event.preventDefault();
            // fix for chrome
            if (!event.fromElement) {
                $.attr(container, "data-hover", "false");
            }
        });
    });

    $.on(container, "drop", (event) => {
        event.preventDefault();
        $.attr(container, "data-hover", "false");
        [...event.dataTransfer.files].forEach((file) => addFile(file));
    });

    $.on($.one("#merge-button"), "click", mergeFiles);
};

function addFile(file) {
    let uuid = crypto.randomUUID();
    addToList(file.name, uuid);
    FILE_LIST.push({ file, uuid });
}

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
    const header = parseInt($.prop(container, "--header-height")); // 44px
    const fileHeight = parseInt($.css(fileElt, "height")); // 50px
    const containerHeight = parseInt($.css(container, "height"));
    const containerTop = $.pos(container).top;
    const MAX_SPEED = 60;
    const SCROLL_NUDGE_RATIO = 1 / 3;
    let placeholder;
    let prevY = 0,
        currentY = 0;
    let isDragging = false;

    $.on($.find(fileElt, ".reorder"), "pointerdown", (event) => {
        prevY = event.clientY; // initial Y position
        isDragging = true;

        event.preventDefault();
        $.on(document, "pointermove", onPointermove);
        $.on(document, "pointerup", onPointerup);
        setMoveStyle(fileElt, true);

        placeholder = $.make(
            `<div id="placeholder" style='width: 100%; height: 50px;'>`
        );
        container.insertBefore(placeholder, fileElt);

        animate(); // for scrolling
    });

    function onPointerup() {
        isDragging = false;
        $.off(document, "pointermove", onPointermove);
        $.off(document, "pointerup", onPointerup);
        setMoveStyle(fileElt, false);
        container.replaceChild(fileElt, placeholder);
    }

    function onPointermove(event) {
        currentY = event.clientY;

        let deltaY = currentY - prevY;

        // clamp mouse to maxTopY
        let maxTopY = containerTop + header;
        currentY = Math.max(currentY, maxTopY);

        // clamp mouse to maxBottomY
        let maxBottomY = containerTop + containerHeight;
        currentY = Math.min(currentY, maxBottomY);

        prevY = currentY;

        let nextY = moveElt(fileElt, deltaY);
        swapElts(nextY);
    }

    function animate() {
        const scrollX = container.scrollLeft;
        const scrollY = container.scrollTop;
        const fileTop = $.pos(fileElt).top;
        const scrollHeight =
            $.pos($.one(".file:last-of-type")).top + fileHeight;

        const pastTop = fileTop - scrollY - (header + 1);
        const pastBottom =
            fileTop + fileHeight - (containerHeight + scrollY) - 1;

        const hasTopSlack = scrollY > 0;
        const hasBottomSlack = scrollY < scrollHeight - containerHeight;

        let scrollDeltaY = 0;
        const thresh = header / 2;
        if (pastBottom > thresh && hasBottomSlack) {
            scrollDeltaY = Math.min(pastBottom * SCROLL_NUDGE_RATIO, MAX_SPEED);
        } else if (pastTop < -thresh && hasTopSlack) {
            scrollDeltaY = Math.max(pastTop * SCROLL_NUDGE_RATIO, -MAX_SPEED);
        }

        if (scrollDeltaY) {
            if (Math.sign(scrollDeltaY) == -1) scrollDeltaY *= 2;
            container.scrollTo(scrollX, scrollY + scrollDeltaY);
            let nextY = moveElt(fileElt, scrollDeltaY);
            swapElts(nextY);
        }

        if (isDragging) requestAnimationFrame(animate);
        else setMoveStyle(fileElt, false);
    }

    function moveElt(elt, dist) {
        let eltY = $.pos(elt).top + dist;
        let scrollY = container.scrollTop;

        // clamp it to top
        let maxTop = Math.max(scrollY, header / 2);
        eltY = Math.max(eltY, maxTop);

        // clamp it to bottom
        let maxBottom = 0;
        /*
         * The clamping is done w.r.t. the last element.
         * If when swaping we swap with last element this causes a problem.
         * In that case we get second to last element and use that as reference.
         */
        let lastFile = $.one(".file:last-of-type");
        let noHeld = $.all(`.file[data-hold="false"]`);
        let lastNotHeld = noHeld[noHeld.length - 1];
        if (lastFile == lastNotHeld) {
            maxBottom = $.pos(lastFile).top + header / 2;
        } else {
            maxBottom = $.pos(lastNotHeld).top + fileHeight + header / 2;
        }
        // if it's not overflown then we use the container reference.
        let containerBottom = containerHeight - fileHeight + header / 2;
        maxBottom = Math.max(maxBottom, containerBottom);

        eltY = Math.min(eltY, maxBottom);

        $.css(elt, "top", `${eltY}px`);
        return eltY;
    }

    function swapElts(eltY) {
        let orgY = $.pos(placeholder).top;
        let changeY = eltY - orgY;

        // move placeholder down to next element
        const thres = header / 2 + fileHeight / 10;
        if (changeY > thres) {
            let nextElt = fileElt.nextElementSibling;
            if (nextElt)
                try {
                    container.insertBefore(nextElt, placeholder);
                } catch {}
        } else if (changeY < -thres) {
            let prevElt = placeholder.previousElementSibling;
            if (prevElt) {
                container.insertBefore(placeholder, prevElt);
                container.insertBefore(fileElt, prevElt);
            }
        }
    }

    function setMoveStyle(elt, should) {
        if (should) {
            let pos = $.pos(elt);
            $.css(elt, "position", "absolute");
            $.css(elt, "top", `${pos.top}px`);
            $.css(elt, "left", `${pos.left}px`);
            $.attr(elt, "data-hold", "true");
        } else {
            elt.removeAttribute("style");
            $.attr(elt, "data-hold", "false");
        }
    }

    $.on(container, "wheel", (event) => {
        if ($.attr(fileElt, "data-hold") == "true") event.preventDefault();
    });

    const duration = parseInt($.prop(fileElt, "--duration"));

    $.on($.find(fileElt, ".remove"), "click", () => {
        // play the animation
        fileElt.classList.add("removing");
        setTimeout(() => {
            container.removeChild(fileElt);
            // decrease number of files
            let listLen = +$.attr(container, "data-files");
            $.attr(container, "data-files", listLen - 1);

            // delete from FILE_LIST
            let uuid = $.attr(fileElt, "data-uuid");
            let index = FILE_LIST.findIndex((f) => f.uuid === uuid);
            assert(index != -1);
            FILE_LIST.splice(index, 1);
        }, duration);
    });
}

function sortList() {
    let sorted_uuids = [...$.all(".file")].map((f) => $.attr(f, "data-uuid"));
    // for safety
    assert(sorted_uuids.length == FILE_LIST.length, {
        sorted_uuids,
        FILE_LIST,
    });
    // sort the list
    for (let i = 0; i < FILE_LIST.length; i++) {
        // if UUID isn't correct
        if (FILE_LIST[i].uuid != sorted_uuids[i]) {
            // search for right file
            for (let j = i + 1; j < FILE_LIST.length; j++) {
                // and swap it so it becomes in correct place
                if (FILE_LIST[j].uuid == sorted_uuids[i]) {
                    [FILE_LIST[i], FILE_LIST[j]] = [FILE_LIST[j], FILE_LIST[i]];
                }
            }
        }
    }
}

function getFileName() {
    let filename = "";
    const extension = "xopp";
    let input = $.one("#output-name").value.toString().trim();

    if (!input) return "untitled.xopp";

    if (input.includes(".")) {
        let arr = input.split(".");
        let ext = arr.pop();
        if (ext != extension) filename = input;
        else filename = arr.join(".");
    } else filename = input;

    return `${filename}.${extension}`;
}

function fileToB64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
    });
}

async function mergeFiles(event) {
    event.preventDefault();

    if (FILE_LIST.length < 2) {
        createModal({
            type: "ok",
            title: "Requirements",
            content: "You need to upload 2 or more files.",
        });
        return;
    }

    sortList();

    const data = {
        files: [],
        output: getFileName(),
    };

    for (let fobj of FILE_LIST) {
        const { file } = fobj;
        data.files.push({
            filename: file.name,
            file: await fileToB64(file),
        });
    }

    const res = await fetch("/api/merge", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
        mode: "cors",
    });
    const size = res.headers.get("Content-Length");
    if (res.status == 200) {
        const modal = createModal({
            type: "download",
            title: "Merged File",
            content: {
                filename: data.output,
                size: size,
            },
        });
        $.on($.find(modal, "#OK"), "click", async () => {
            downloadFile(await res.blob(), data.output);
        });
    }
}

function downloadFile(blob, filename) {
    const link = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = link;
    a.download = filename;

    // Firefox requires the link to be added to the DOM before click()
    a.onclick = (e) => {
        document.body.removeChild(e.target); // destroyClickedElement
        e.stopPropagation();
    };

    a.style.display = "none";
    document.body.appendChild(a);

    // Safari will open this file in the same page as a confusing Blob.
    if (this._isSafari) {
        let aText = "Hello, Safari user! To download this file...\n";
        aText += "1. Go to File --> Save As.\n";
        aText += '2. Choose "Page Source" as the Format.\n';
        aText += `3. Name it with this extension: ."${fx[1]}"`;
        alert(aText);
    }
    a.click();
}

function createModal(config) {
    assert(config, "Missing config.");
    ["type", "title", "content"].forEach((prop) =>
        assert(config[prop], `Missing modal ${prop}.`)
    );
    assert(
        config.type === "ok" ||
            config.type === "download" ||
            config.type === "error",
        `${config.type} isn't a valid modal type.`
    );

    let content;
    switch (config.type) {
        case "error":
            content = $.make(`
            <div class="error">
                <p>An error occured:</p>
                <code>${config.content.toString()}</code>
            </div>`);
            break;

        case "download":
            content = $.make(`
            <div class="file">
                <span class="name">${config.content.filename.toString()}</span>
                <span class="size">${config.content.size.toString()}</span>
            </div>`);
            break;

        default:
            content = $.make(`<p>${config.content.toString()}</p>`);
            break;
    }

    const modal = $.make(`
    <div class="xpp_modal-container" id="modal">
        <div class="background"></div>
        <div class="xpp_modal" data-type="${config.type}">
            <div class="header">
                <span class="title">${config.title.toString()}</span>
                <span id="modal_close" class="no-select">close</span>
                <hr>
            </div>
            <div class="content"></div>
            <div class="footer">
                <hr>
                <button id="OK" type="button" class="primary-btn">OK</button>
            </div>
        </div>
    </div>
    `);

    $.find(modal, ".content").append(content);
    if (config.type == "download") {
        $.find(modal, "#OK").innerText = "Download";
    }

    setupModalEvent(modal, config.type);

    $.all("#modal").forEach((modal) => document.body.removeChild(modal));
    document.body.append(modal);

    return modal;
}

function setupModalEvent(modal, type) {
    $.on($.find(modal, "#modal_close"), "click", () =>
        document.body.removeChild(modal)
    );
    if (type !== "download")
        $.on($.find(modal, "#OK"), "click", () =>
            document.body.removeChild(modal)
        );
}
