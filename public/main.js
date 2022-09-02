$(document).ready(() => {
    // const picker = $("#file_upload");
    // const ListContainer = $("#file-container");

    // ListContainer.on("click", (e) => {
    //     if (e.target == ListContainer[0]) {
    //         picker.click();
    //     }
    // });
    // picker.on("change", (e) => {
    //     let files = picker[0].files;
    //     for (let i = 0; i < files.length; i++) {
    //         addToList(files[i].name);
    //     }
    // });

    for (let i = 1; i <= 10; i++) {
        addToList(`File ${i}`);
    }
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
        console.log({ top: pos.top });

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
            // we get the differnce in y position when moved
            let deltaY = currentY - prevY;
            // calculate nextY position of the div.file
            let nextY = fileElt.position().top + deltaY;
            // if div.file is in hitting the header then clamp it
            nextY = nextY < h / 2 ? h / 2 : nextY;
            // if our mouse goes above the header then clamp it
            prevY = currentY < topY ? topY : currentY;
            console.log({ prevY, topY, currentY, deltaY });
            // if we need to move it down
            // if (nextY > pos.top + h / 2) {
            //     let nextElt = fake.next(".file");
            //     if (nextElt.length) {
            //         pos = nextElt.position();
            //         nextElt.insertBefore(fake);
            //     }
            //     // or we need to move it up
            // } else if (nextY < pos.top - h / 2) {
            //     let prevElt = fake.prev(".file");
            //     if (prevElt.length) {
            //         pos = prevElt.position();
            //         fake.insertBefore(prevElt);
            //     }
            // }
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
