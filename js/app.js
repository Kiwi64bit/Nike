const mainColors = ["hsl(2, 94%, 57%)", "hsl(211, 65%, 53%)", "hsl(35, 90%, 45%)"];
const logos = ["logo_red.png", "logo_blue.png", "logo_yellow.png"];
const titleImages = ["icon_red.png", "icon_blue.png", "icon_yellow.png"];

const nikeLogo = document.getElementById("nikeLogo");

const heroSliderElement = document.getElementById("heroSlideShow");
const heroSlider = {
    sliderElement: heroSliderElement,
    slides: Array.from(heroSliderElement.querySelectorAll(".slide")),
    prevBtn: heroSliderElement.querySelector(".slide-show-control-prev"),
    nextBtn: heroSliderElement.querySelector(".slide-show-control-next"),
    currentIndex: 0,

    updateSlide: function (index) {
        transferClass(this.slides[index], "active");
        onNextFrame(() => transferClass(this.slides[index], "show"));
    },

    nextSlide: function () {
        this.currentIndex++;
        this.currentIndex = this.currentIndex % this.slides.length;
        this.updateUI(this.currentIndex);
    },

    prevSlide: function () {
        this.currentIndex--;
        this.currentIndex = (this.currentIndex + this.slides.length) % this.slides.length;
        this.updateUI(this.currentIndex);
    },

    updateUI: function (index) {
        this.updateSlide(index);
        updateMainColor(mainColors[index]);
        updateTitleImage(titleImages[index]);
        nikeLogo.src = `images/logo/${logos[index]}`;
    },
};

const navbar = document.querySelector("nav");
const smartNavItems = navbar.querySelectorAll(".smart-nav-item");
const navLinks = navbar.querySelectorAll(".smart-nav-item a[href^='#']");
const sections = document.querySelectorAll("header, section");
const scrollSpyOffset = navbar.offsetHeight + 10;

for (const link of navLinks) {
    link.addEventListener("click", event => {
        event.preventDefault();
        const href = link.getAttribute("href");
        if (href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;

        let yPos = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
        window.scrollTo({ top: yPos, behavior: "smooth" });
    });
}

const latestProducts = latest.map(productData => {
    const latestCard = createLatestCard(productData);
    const colWrapper = document.createElement("div");
    colWrapper.classList.add("col");
    colWrapper.appendChild(latestCard);
    return colWrapper;
});
appendProducts(latestProducts, document.getElementById("latestContainer"));

const featuredProducts = featured.map(productData => {
    const featuredCard = createFeaturedCard(productData);
    const colWrapper = document.createElement("div");
    colWrapper.classList.add("col");
    colWrapper.appendChild(featuredCard);
    return colWrapper;
});
appendProducts(featuredProducts, document.getElementById("featuredContainer"));

window.addEventListener("scroll", () => rafThrottle(scrollSpy(sections, navbar, scrollSpyOffset)));

const modals = document.querySelectorAll(`.custom-modal`);
const toggleModalBtns = document.querySelectorAll(`[data-toggle~="modal"]`);
const updateProductModalBtns = document.querySelectorAll(`[data-toggle~="productModal"]`);
const dismissModalBtns = document.querySelectorAll(`[data-dismiss="modal"]`);

for (const modal of modals) {
    modal.addEventListener("click", event => {
        const modalContent = modal.querySelector(".custom-modal-content");
        if (!modalContent.contains(event.target)) {
            closeModal(`#${modal.id}`);
        }
    });
}

for (const btn of toggleModalBtns) {
    btn.addEventListener("click", () => {
        toggleModal(btn.dataset.target);
    });
}

for (const btn of dismissModalBtns) {
    btn.addEventListener("click", () => {
        closeModal(btn.dataset.target);
    });
}

for (const btn of updateProductModalBtns) {
    btn.addEventListener("click", () => {
        const data = products.find(product => product.id == btn.dataset.id);
        const productCard = createLatestCard(data);
        updateModalContent(btn.dataset.target, productCard.outerHTML);
    });
}

const controlsFile = {
    ArrowLeft: () => {
        heroSlider.prevSlide();
    },
    ArrowRight: () => {
        heroSlider.nextSlide();
    },
    Escape: () => {
        const modal = document.querySelector(".custom-modal.active");
        if (!modal) return;
        closeModal(`#${modal.id}`);
    },
};

window.addEventListener("keyup", event => {
    controlsFile[event.key]?.();
});
