var slides = document.querySelectorAll('.slide');
var hotspots = document.querySelectorAll('[flow]');
var artboardIndex = 0;
var scrollPosition = 0;
var currentAnimation = '';
var skipHighlight = false;

function ReverseAnimation(animation) {
    switch (animation) {
        case 'fromleft':
            return 'fromright';
            break;
        case 'fromright':
            return 'fromleft';
            break;
        case 'fromtop':
            return 'frombottom';
            break;
        case 'frombottom':
            return 'fromtop';
            break;
        default:
            return 'none';
            break;
    }
}

function getFrame(slide) {

}

function ResetAnimation(slide) {
    slide.firstElementChild.classList.remove('fromleft');
    slide.firstElementChild.classList.remove('fromright');
    slide.firstElementChild.classList.remove('fromtop');
    slide.firstElementChild.classList.remove('frombottom');

    slide.firstElementChild.classList.remove('toleft');
    slide.firstElementChild.classList.remove('toright');
    slide.firstElementChild.classList.remove('totop');
    slide.firstElementChild.classList.remove('tobottom');

    slide.firstElementChild.classList.remove('hide');
    slide.firstElementChild.classList.remove('restore');

    slide.classList.remove('hidden');
}

function ApplyAnimation(slide, animation, back) {
    if (back) {
        switch (animation) {
            case 'fromleft':
                slide.style.zIndex = 2;
                slide.firstElementChild.classList.add('toleft');
                break;
            case 'fromright':
                slide.style.zIndex = 2;
                slide.firstElementChild.classList.add('toright');
                break;
            case 'fromtop':
                slide.style.zIndex = 2;
                slide.firstElementChild.classList.add('totop');
                break;
            case 'frombottom':
                slide.style.zIndex = 2;
                slide.firstElementChild.classList.add('tobottom');
                break;
            default:
                slide.style.zIndex = 0;
                slide.classList.add('hidden');
                break;
        }
        return;
    }
    slide.style.zIndex = 1;
    switch (animation) {
        case 'fromleft':
            slide.firstElementChild.classList.add('fromleft');
            break;
        case 'fromright':
            slide.firstElementChild.classList.add('fromright');
            break;
        case 'fromtop':
            slide.firstElementChild.classList.add('fromtop');
            break;
        case 'frombottom':
            slide.firstElementChild.classList.add('frombottom');
            break;
        default:
            //slide.classList.add('restore');
            break;
    }
}

function PresentSlide(slide, animation, fast, isBack, maintainScrollPosition) {
    if (slide.classList.contains('visible')) {
        return;
    }
    ResetAnimation(slide);
    if (maintainScrollPosition) {
        slide.firstElementChild.firstElementChild.scrollTop = scrollPosition;
    }
    if (!fast) {
        if (isBack) {
            //slide.classList.add('restore');
        }
        else {
            currentAnimation = animation;
            ApplyAnimation(slide, animation, false);
        }
    }
    slide.style.zIndex = 1;
    slide.classList.add('visible');
    document.title = slide.getAttribute('name');
}

function HideSlide(slide, animation, fast, isBack) {
    if (fast || animation == "none") {
        slide.style.zIndex = 0;
        ResetAnimation(slide);
        slide.classList.add('hidden');
        slide.classList.remove('visible');
    }
    else {
        if (!slide.classList.contains('visible')) {
            return;
        }
        slide.classList.remove('visible');
        ResetAnimation(slide);
        if (isBack) {
            ApplyAnimation(slide, currentAnimation, true);
        }
        else {
            slide.style.zIndex = 0;
            slide.firstElementChild.classList.add('hide');
        }
    }
}

function SelectFirstSlide(animation, fast, isBack) {
    for (var i = 0; i < slides.length; i++) {
        if (i == 0) {
            PresentSlide(slides[i], animation, fast, isBack, false);
        }
        else {
            HideSlide(slides[i], animation, fast, isBack);
        }
    }
}

function SelectSlide(id, animation, fast, isBack, maintainScrollPosition) {
    if (id === undefined || id === null || id.length < 32) {
        if (id == "back") {
            window.history.back();
        } else {
            SelectFirstSlide(animation, fast, isBack);
        }
        return;
    }
    if (maintainScrollPosition) {
        var visibleScrolls = document.querySelectorAll(".slide.visible .slideScroll");
        scrollPosition = visibleScrolls.length > 0 ? visibleScrolls[0].scrollTop : 0;
    }
    for (var i = 0; i < slides.length; i++) {
        if (slides[i].getAttribute('artboard') == id) {
            PresentSlide(slides[i], animation, fast, isBack, maintainScrollPosition);
        } else {
            HideSlide(slides[i], animation, fast, isBack);
        }
    }
}

function ShowSlide(id, animation, maintainScrollPosition) {
    skipHighlight = true;
    SelectSlide(id, animation, false, false, maintainScrollPosition);
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?artboard=' + id + '&animation=' + animation;
    history.pushState({ "id": id, "animation": animation, "index": artboardIndex }, '', newurl);
    artboardIndex++;
}

function ShowSlideFromPageParameters(isBack) {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var artboardParameter = urlParams.get('artboard');
    var animationParameter = urlParams.get('animation');
    SelectSlide(artboardParameter, animationParameter, !isBack, isBack);
    artboardIndex = 0;
    currentAnimation = '';
}

function UpdateSlideSizes() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    for (var i = 0; i < slides.length; i++) {
        var slide = slides[i];
        var width = parseInt(slide.style.width.replace('px', ''));
        var height = parseInt(slide.style.height.replace('px', ''));
        if (windowWidth > width &&
            windowHeight > height) {
            slide.style.transform = "scale(1,1)";
        }
        else
        {
            var scale = Math.min(windowWidth / width, windowHeight / height);
            slide.style.transform = "scale(" + scale + "," + scale + ")";
        }
    }
}

function HighlightHotspots() {
    if (skipHighlight) {
        skipHighlight = false;
        return;
    }
    var hotspots = document.querySelectorAll(".slide.visible .hotspot");
    for (var i = 0; i < hotspots.length; i++) {
        hotspots[i].classList.add("highlight");
    }
    setTimeout(function () {
        for (var i = 0; i < hotspots.length; i++) {
            hotspots[i].classList.remove("highlight");
        }
    }, 500);
}

window.onpopstate = function (event) {
    if (event.state == null) {
        ShowSlideFromPageParameters(true);
        return null;
    }
    var isBack = artboardIndex > event.state.index;
    artboardIndex = Number.isInteger(event.state.index) ? event.state.index : 0;
    SelectSlide(event.state.id, event.state.animation, false, isBack);
    currentAnimation = event.state.animation;
};



ShowSlideFromPageParameters(false);
UpdateSlideSizes();
window.addEventListener('resize', UpdateSlideSizes);
document.body.addEventListener("click", HighlightHotspots);


//var animation = isBack ? ReverseAnimation(currentAnimation) : event.state.animation;
//currentAnimation = event.state.animation;