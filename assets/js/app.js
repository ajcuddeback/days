let controller;
let slideScene;
let pageScene

function animateSlides() {
    //Init controller for scroll magic
    controller = new ScrollMagic.Controller();
    // Select things
    const sliders = document.querySelectorAll(".slide");
    const nav = document.querySelector('.nav-header');
    //Loop over each slide
    sliders.forEach((slide, index, slides) => {
        const revealImg = slide.querySelector(".reveal-img");
        const img = slide.querySelector("img");
        const revealText = slide.querySelector('.reveal-text');

        //GSAP
        // make timeline
        const slideTl = gsap.timeline({
            // default for timeline
            defaults: { duration: 1, ease: "power2.inOut" }
        });
        // moving the cover div away
        slideTl.fromTo(revealImg, { x: '0%' }, { x: "100%" })
        //shrinking the image (the image has a overflow hidden to hide the extra img when it grows) 
        //and -=1 will let the animation start 1s sooner
        slideTl.fromTo(img, { scale: 2 }, { scale: 1 }, '-=1')
        // Reavealing text
        slideTl.fromTo(revealText, { x: '0%' }, { x: "100%" }, "-=0.75")
        //moveing the nav elements
        slideTl.fromTo(nav, { y: '-100%' }, { y: '0%' }, "-=0.5")

        // Create Scene
        slideScene = new ScrollMagic.Scene({
            // the trigger element is going to be the slide(each slide because of foreach)
            triggerElement: slide,
            //where on the page the animation will trigger
            triggerHook: 0.25,
            //this reverse false object will make it to where the images will always stay there. 
            reverse: false
        })
            // this tween will make the gsap animation (slideTl) only happen when the scroll magic gets triggered
            .setTween(slideTl)
            // indicators with custom name and colors
            // .addIndicators({ colorStart: 'white', colorTrigger: 'white', name: 'slide' })
            //This will add to the controller
            .addTo(controller)
        // New Animation
        const pageTl = gsap.timeline();
        let nextSlide = slides.length - 1 === index ? 'end' : slide[index + 1];
        pageTl.fromTo(nextSlide, { y: '0%' }, { y: "50%" })
        pageTl.fromTo(slide, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.5 })
        pageTl.fromTo(nextSlide, { y: '50%' }, { y: "0%" }, '-=0.5')
        //create new scene
        pageScene = new ScrollMagic.Scene({
            triggerElement: slide,
            // this duration will be based on the height of the slide itself(which is pretty much whole page)
            duration: '100%',
            triggerHook: 0
        })
            // .addIndicators({ colorStart: 'white', colorTrigger: 'white', name: 'page', indent: 200 })
            // This pin will pin the slide div to the screen while animation is running. Kind of like position fixed
            //push followers will make the next item coming in come in right away
            .setPin(slide, { pushFollowers: false })
            .setTween(pageTl)
            .addTo(controller)
    })
}
const mouse = document.querySelector('.cursor');
const mouseText = mouse.querySelector('span');
const burger = document.querySelector('.burger')
function cursor(e) {
    mouse.style.top = e.pageY + "px";
    mouse.style.left = e.pageX + "px";
}
function activeCursor(e) {
    const item = e.target;
    if (item.id === 'logo' || item.classList.contains('burger')) {
        mouse.classList.add('nav-active');
    } else {
        mouse.classList.remove('nav-active');
    }

    if (item.classList.contains('explore')) {
        mouse.classList.add('explore-active');
        gsap.to(".title-swipe", 1, { y: "0%" })
        mouseText.innerText = "Tap";
    } else {
        mouse.classList.remove('explore-active');
        gsap.to(".title-swipe", 1, { y: "100%" })
        mouseText.innerText = "";
    }
}
function navToggle(e) {
    if (!e.target.classList.contains('active')) {
        e.target.classList.add('active')
        gsap.to(".line1", 0.5, { rotate: "45", y: 5, background: 'black' });
        gsap.to(".line2", 0.5, { rotate: "-45", y: -5, background: 'black' });
        gsap.to("#logo", 1, { color: 'black' });
        gsap.to(".nav-bar", 1, { clipPath: 'circle(2500px at 100% -10%)' })
        document.body.classList.add('.hide');
    } else {
        e.target.classList.remove('active')
        gsap.to(".line1", 0.5, { rotate: "0", y: 0, background: 'white' });
        gsap.to(".line2", 0.5, { rotate: "0", y: 0, background: 'white' });
        gsap.to("#logo", 1, { color: 'white' });
        gsap.to(".nav-bar", 1, { clipPath: 'circle(50px at 100% -10%)' })
        document.body.classList.remove('.hide');
    }
}

// Barba Page transitions
const logo = document.querySelector('#logo');
barba.init({
    // this is where you can edit specific items per page
    views: [
        {
            namespace: 'home',
            // Before we enter run this function
            beforeEnter() {
                animateSlides();
                logo.href = './index.html'
            },
            // Before we leave to the next page destory all gsap and scroll animations
            beforeLeave() {
                slideScene.destroy();
                pageScene.destroy();
                controller.destroy();
            }
        },
        {
            namespace: 'fashion',
            beforeEnter() {
                logo.href = '../index.html'
                gsap.fromTo('.nav-header', 1, { y: '100%' }, { y: '0%', ease: 'power2.inOut' })
            }
        }
    ],
    // these transitions will happen to both pages 
    transitions: [
        {
            // using the current as the current content page you are on. anything that gets done in here is when you leave
            leave({ current, next }) {
                let done = this.async();
                // animation
                const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
                tl.fromTo(current.container, 1, { opacity: 1 }, { opacity: 0 })
                tl.fromTo('.swipe', 0.75, { x: '-100%' }, { x: '0%', onComplete: done }, '-=.05')
            },
            // Once you have started to enter in to new page this stuff will happen
            enter({ current, next }) {
                let done = this.async();
                window.scrollTo(0, 0)
                const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
                tl.fromTo('.swipe', 1, { x: '0' }, { x: '100%', stagger: 0.25, onComplete: done })
                tl.fromTo(next.container, 1, { opacity: 0 }, { opacity: 1 })
            }
        }
    ]
})


window.addEventListener('mousemove', cursor);
window.addEventListener('mouseover', activeCursor)
burger.addEventListener('click', navToggle)
