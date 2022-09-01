$(document).ready(() => {
    const picker = $("#file_upload");
    const ListContainer = $("#file-container");

    ListContainer.on("click", (e) => {
        if (e.target == ListContainer[0]) {
            picker.click();
        }
    });
    picker.on("change", (e) => {
        let filename = picker.val().replace(/.*(\/|\\)/, "");
        addToList(filename);
    });
});

function setupListItemEvent(fileDom) {
    // initialize constants
    const container = $("#file-container");
    const h = 44;
    const topY = container.position().top + h;

    // set correct file list
    container.attr("data-files", container.children(".file").length);

    // convert element to jquery element
    let fileElt = $(fileDom);

    // if we hit on the remove button
    fileElt.find(".remove").on("click", () => {
        fileElt.slideUp("", () => {
            fileElt.remove();
            container.attr("data-files", container.attr("data-files") - 1);
        });
    });

    // if we drag from the reorder div
    fileElt.find(".reorder").on("mousedown", (e) => {
        // get current pos
        let pos = fileElt.position();

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
            // we check if the currentY clamp it to ceiling of the div
            let currentY = e.clientY;
            currentY = currentY < topY ? topY : currentY;
            // we get the differnce in y position when moved
            let deltaY = currentY - prevY;
            prevY = currentY;
            // calculate nextY position of the div.file
            let nextY = fileElt.position().top + deltaY;
            // if we need to move it down
            if (nextY > pos.top + h / 2) {
                let nextElt = fake.next(".file");
                if (nextElt.length) {
                    pos = nextElt.position();
                    nextElt.insertBefore(fake);
                }
                // or we need to move it up
            } else if (nextY < pos.top - h / 2) {
                let prevElt = fake.prev(".file");
                if (prevElt.length) {
                    pos = prevElt.position();
                    fake.insertBefore(prevElt);
                }
            }
            // and move it
            fileElt.css("top", `${nextY}px`);
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

function addToList(name) {
    // append file to list
    let fileElt = $(`
    <div class="file" data-hold="false">
        <span class="reorder no-select">menu</span>
        <span class="name">${name.toString()}</span>
        <span class="remove no-select">close</span>
    </div>
    `).insertBefore("#file_copy");
    // setup events for that item
    setupListItemEvent(fileElt);
}
