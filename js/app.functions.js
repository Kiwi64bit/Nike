// Utility
function closestSibling(element, selector) {
    const relative = element?.parentElement?.querySelector(selector);
    return relative;
}

function closestDescendant(element, selector) {
    if (element.matches(selector)) {
        return element;
    }
    return element.querySelector(selector);
}

function transferClass(element, className) {
    const currentActive = closestSibling(element, `.${className}`);
    currentActive?.classList.remove(className);
    element?.classList.add(className);
}

function onNextFrame(callback) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            callback.apply(this);
        });
    });
}

// UI updates
function updateMainColor(color) {
    document.documentElement.style.setProperty("--main-color", color);
}

function updateTitleImage(fileName) {
    const root = document.documentElement;
    const folderPath = getComputedStyle(root).getPropertyValue("--title-image-folder").replace(/["']/g, "");
    root.style.setProperty("--title-image-url", `url("${folderPath}/${fileName}")`);
}

function updateTargetImage(element) {
    const currentSrc = closestDescendant(element, "[src]").getAttribute("src");
    if (!currentSrc) return;
    const targetSelector = element.dataset.target;
    const target = document.querySelector(targetSelector);
    const targetImage = closestDescendant(target, "[src]");
    targetImage?.setAttribute("src", currentSrc);
}

function updateModalContent(targetSelector, innerContent) {
    const modal = document.querySelector(targetSelector);
    const modalBody = modal.querySelector(".custom-modal-body");
    modalBody.innerHTML = innerContent;
}

// UI control
function openModal(targetSelector) {
    const modal = document.querySelector(targetSelector);
    modal.classList.add("active");
    onNextFrame(() => modal.classList.add("show"));
}

function closeModal(targetSelector) {
    const modal = document.querySelector(targetSelector);
    modal.classList.remove("show");

    modal.addEventListener("transitionend", function handler(event) {
        if (event.target === modal && event.propertyName === "opacity") {
            modal.classList.remove("active");
            modal.removeEventListener("transitionend", handler);
        }
    });
}

function toggleModal(targetSelector) {
    const modal = document.querySelector(targetSelector);
    if (!modal.classList.contains("active")) {
        openModal(targetSelector);
        return;
    }
    closeModal(targetSelector);
}

// Create
function createThumbnailImages(images, target) {
    const thumbnailImages = document.createElement("div");
    thumbnailImages.classList.add(
        ...`row m-0 gy-0 gx-1 gx-sm-2 col-12 row-cols-${images.length} row-gap-2 row-cols-md-1 col-md-2 gx-md-0`.split(
            " "
        )
    );
    for (let i = 0; i < images.length; i++) {
        thumbnailImages.innerHTML += `
            <div class="col">
                <div class="thumbnail p-1 rounded-3 border border-1 border-main overflow-hidden"
                    style="aspect-ratio: 1;" data-target=${target}
                    onclick="updateTargetImage(this)">
                    <img src="images/products/${images[i]}" alt="" class="img-fluid">
                </div>
            </div>`;
    }
    return thumbnailImages;
}

function createPrice(price, discount) {
    const priceElement = document.createElement("span");
    const oldPrice = discount ? `<del class="text-danger">$${price.toFixed(2)}</del>` : ``;
    priceElement.innerHTML = `${oldPrice} $${((1 - discount) * price).toFixed(2)}`;
    return priceElement;
}

function createSizeIndicators(sizes) {
    const indicatorsRow = document.createElement("span");
    indicatorsRow.classList.add(..."d-flex flex-wrap gap-2 fs-6".split(" "));
    for (const size of sizes) {
        indicatorsRow.innerHTML += `<span class="indicator-size" onclick="transferClass(this, 'active')">${size}</span>`;
    }
    indicatorsRow.firstElementChild.classList.add("active");
    return indicatorsRow;
}

function createColorIndicators(colors) {
    const indicatorsRow = document.createElement("span");
    indicatorsRow.classList.add(..."d-flex flex-wrap gap-2 fs-6".split(" "));
    for (const color of colors) {
        indicatorsRow.innerHTML += `<span class="indicator-color" style="background-color: ${color};"
        onclick="transferClass(this, 'active')"></span>`;
    }
    indicatorsRow.firstElementChild.classList.add("active");
    return indicatorsRow;
}

function createImageIndicators(images, target) {
    const indicatorsContainer = document.createElement("div");
    indicatorsContainer.classList.add(..."indicators d-flex justify-content-center align-items-center".split(" "));
    for (let i = 0; i < images.length; i++) {
        indicatorsContainer.innerHTML += `
            <span class="indicator rounded-circle mx-1" src="images/products/${images[i]}"
            data-target="#${target}" style="width: 1em; aspect-ratio: 1;"
            onclick="updateTargetImage(this); transferClass(this, 'active')"></span>`;
    }
    indicatorsContainer.firstElementChild.classList.add("active");
    return indicatorsContainer;
}

function createLatestCard(data) {
    const latestCard = document.createElement("div");
    latestCard.classList.add(..."latest-card bg-light rounded-3 border border-2 border-main".split(" "));
    latestCard.innerHTML = `
        <div class="row g-0 p-3 row-gap-4">
            <div class="row g-0 col-12 col-lg-6">
                ${createThumbnailImages(data.images, "#latestMainImage" + data.id).outerHTML}
                <div id="latestMainImage${data.id}"
                    class="main-image col-12 col-md-10 d-flex justify-content-center align-items-center">
                    <img src="images/products/${data.images[0]}" alt="" class="img-fluid w-75">
                </div>
            </div>
            <div class="col-12 col-lg-6">
                <h2 class="text-main">${data.name}</h2>
                <p class="text-secondary">${data.description}</p>
                <p><b>Price:</b> ${createPrice(data.price, data.discount).outerHTML}</p>
                <p><b>Sizes:</b> ${createSizeIndicators(data.sizes).outerHTML}</p>
                <p><b>Colors:</b> ${createColorIndicators(data.colors).outerHTML}</p>
                <button class="btn btn-outline-main">Add to cart</button>
            </div>
        </div>`;
    return latestCard;
}

function createFeaturedCard(data) {
    const featuredCard = document.createElement("div");
    featuredCard.classList.add(..."featured-card text-center p-3 bg-light rounded-3 overflow-hidden".split(" "));
    featuredCard.innerHTML = `
        <div class="card-image p-1 my-4">
            <img id="featuredMainImage${data.id}" src="images/products/${data.images[0]}" 
            alt="" class="img-fluid">
            <div class="controls vstack justify-content-center align-items-center row-gap-3">
                <div class="view-btn-container">
                    <button class="view-btn btn btn-outline-main fs-6 rounded-circle"
                        data-toggle="modal productModal" data-target="#productModal0"
                        data-id=${data.id}>
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
                ${createImageIndicators(data.images, "featuredMainImage" + data.id).outerHTML}
            </div>
        </div>
        <div class="card-text">
            <h6>${data.name}</h6>
            ${createPrice(data.price, data.discount).outerHTML}
            <span class="${data.discount ? "" : "d-none"} discount w-100 text-light bg-main">
                ${data.discount * 100}%
            </span>
        </div>`;
    return featuredCard;
}

// Append
function appendProducts(products, section) {
    for (const product of products) {
        section.appendChild(product);
    }
}

// Scroll Spy
function getCurrentSection(sections, offset = 0) {
    for (const section of sections) {
        const currentScrollPos = document.documentElement.scrollTop + offset;

        const startAt = section.offsetTop;
        const endAt = startAt + section.offsetHeight;

        const isInView = startAt <= currentScrollPos && currentScrollPos < endAt;
        if (isInView) return section;
    }
    return null;
}

function getCurrentMenuItem(navbar, id) {
    const menuItem = navbar.querySelector(`.smart-nav-item:has(a[href="#${id}"])`);
    return menuItem;
}

function scrollSpy(sections, menu, offset) {
    const section = getCurrentSection(sections, offset);
    const menuItem = getCurrentMenuItem(menu, section?.getAttribute("id"));
    transferClass(menuItem, "active");
}

function throttle(callback, delay) {
    let ticking = false; // Control flag

    // Returning a throttled version
    return function (...args) {
        if (!ticking) {
            callback.apply(this, args); // Run the callback function
            setTimeout(() => {
                ticking = false; // Allow calls after delay
            }, delay);
            ticking = true; // Block further calls
        }
    };
}

function rafThrottle(callback) {
    let ticking = false;

    return function (...args) {
        if (!ticking) {
            requestAnimationFrame(() => {
                callback.apply(this, args);
                ticking = false;
            });
            ticking = true;
        }
    };
}