const fileList = [];

$(window).on("load", () => {
    const picker = $("#file_upload");

    $("#file_add").on("click", () => picker.click());

    picker.on("change", (e) => {
        let files = picker[0].files;
        for (let i = 0; i < files.length; i++) {
            let uuid = crypto.randomUUID();
            fileList.push({ file: files[i], uuid });
            addToList(files[i].name, uuid);
        }
    });
});

function addToList(name, uuid) {
    // append file to list
    let fileElt = $(`
    <div class="file" data-hold="false" data-uuid="${uuid.toString()}">
        <span class="reorder no-select">menu</span>
        <span class="name">${name.toString()}</span>
        <span class="remove no-select">close</span>
    </div>
    `).insertBefore("#file_copy");
    // setup events for that item
    setupListItemEvent(fileElt);
}

const max = (a, b) => (a > b ? a : b);
const min = (a, b) => (a < b ? a : b);

function setupListItemEvent(fileDom) {
    // initialize constants
    const container = $("#file-container");
    const h = 44;
    const topY = container.position().top + h;
    const bottomY = container.height() - 1.25 * h;

    // set correct file list
    container.attr("data-files", container.children(".file").length);

    // convert element to jquery element
    let fileElt = $(fileDom);

    // if we hit on the remove button
    fileElt.find(".remove").on("click", () => {
        fileElt.slideUp("", () => {
            let uuid = fileElt.attr("data-uuid");
            for (let i = 0; i < fileList.length; i++) {
                if (fileList[i].uuid == uuid) {
                    fileList.splice(i, 1);
                    break;
                }
            }
            fileElt.remove();
            container.attr("data-files", container.attr("data-files") - 1);
        });
    });

    // if we drag from the reorder div
    fileElt.find(".reorder").on("mousedown", (e) => {
        // get current pos
        let pos = fileElt.position();
        // adjust with offset
        pos.top += container.scrollTop();

        // change element styling for now
        fileElt.css("position", "absolute");
        fileElt.css("top", `${pos.top}px`);
        fileElt.css("left", `${pos.left}px`);
        fileElt.attr("data-hold", "true");

        // put a fake element in-place of it
        let fake = $(`<div class="fake" style='width: 100%; height: 50px;'>`);
        fake.insertBefore(fileElt);

        // get inital Y position
        let prevY = e.clientY;

        // when we move our mouse
        $(document).on("mousemove", (e) => {
            // get current y pos
            let currentY = e.clientY;
            // get current offset
            let offset = container.scrollTop();
            // we get the differnce in y position when moved
            let deltaY = currentY - prevY;
            // calculate nextY position of the div.file
            let nextY = fileElt.position().top + deltaY + offset;
            // if div.file is hitting the header then clamp it
            let header = h / 2 + offset;
            nextY = max(nextY, header);
            // if div.file is hitting the bottom then clamp it
            let bottom = bottomY + offset;
            nextY = min(nextY, bottom);
            // if our mouse goes above the header then clamp it
            prevY = max(currentY, topY);
            // if our mouse goes below the bottom then clamp it
            let bottomCon = container.height() + container.position().top;
            prevY = min(prevY, bottomCon - h / 2);
            // if we need to swap it down
            if (nextY > pos.top + offset + h / 2) {
                let nextElt = fake.next(".file");
                if (nextElt.length) {
                    pos = nextElt.position();
                    nextElt.insertBefore(fake);
                }
                // or we need to swap it up
            } else if (nextY < pos.top + offset - h / 2) {
                let prevElt = fake.prev(".file");
                if (prevElt.length) {
                    pos = prevElt.position();
                    fake.insertBefore(prevElt);
                }
            }
            // and move it
            fileElt.css("top", `${nextY}px`);

            // TODO: Fix scrolling
            // setup scrolling
            if (offset >= 0 && (nextY == header || nextY == bottom)) {
                container.scrollTop(offset + deltaY);
            }
        });

        // when we release the mouse
        $(document).on("mouseup", () => {
            // delete the events
            $(document).off("mousemove");
            $(document).off("mouseup");

            // change element styling back
            fileElt.css("position", "relative");
            fileElt.css("top", "");
            fileElt.css("left", "");
            fileElt.attr("data-hold", "false");
            // put original element correct place
            fake.replaceWith(fileElt);
        });
    });
}
