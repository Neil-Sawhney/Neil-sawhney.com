const obitag = document.getElementsByClassName("obitag");
const name = document.querySelector(".name");
const nameText = name.textContent;
const about = document.querySelector(".about");
const cover = document.querySelector(".cover");
const page1 = document.querySelector(".page1");
const page2 = document.querySelector(".page2");
const page3 = document.querySelector(".page3");
const quote = document.querySelector(".quote");
const page1Content = document.querySelector(".page1Content");
const page2Content = document.querySelector(".page2Content");
const page3Content = document.querySelector(".page3Content");
const quoteContent = document.querySelector(".quoteContent");

var mobileMinWidth = 800;
nameColor = "#5aa19b";




//stuff that must start after everything is loaded
document.querySelector(".cover").style.display = "none";
document.querySelector(".name").style.display = "block";

const splitName = nameText.split("");
name.textContent = "";

for (let i = 0; i < splitName.length; i++) {
	name.innerHTML += "<span>" + splitName[i] + "</span>";
}

let char = 0;
let timer = setInterval(onTick, 100);

function onTick() {

	if (char === splitName.length - 1) {
		clearInterval(timer);
		timer = null;
	}
	const span = name.querySelectorAll('span')[char];
	span.classList.add('fade');
	if (char != 4) span.style.display = "inline-block";
	char++;
}


//doc Height Mobile Fix
setInterval(fixHeight, 100);

var minMobileHeight = 40; //in vh
var togglytog = false;

function fixHeight() {
	if (document.documentElement.clientWidth < mobileMinWidth) {
		if (document.querySelector(".pagesWrapper").clientHeight > minMobileHeight / 100 * document.documentElement.clientWidth) {
			document.querySelector(".mobileBox").style.height = 50 + (document.querySelector(".pagesWrapper").clientHeight + document.querySelector(".pagesWrapper").offsetTop) + "px";
			document.querySelector(".georgeWrapper").style.top = 50 + (document.querySelector(".pagesWrapper").clientHeight + document.querySelector(".pagesWrapper").offsetTop) + "px";

		} else if (document.querySelector(".about").style.display != "none") {
			document.querySelector(".mobileBox").style.height = 10 + minMobileHeight + (document.querySelector(".about").clientHeight * 100) / document.body.clientWidth + "vw";
			document.querySelector(".georgeWrapper").style.top = 10 + minMobileHeight + (document.querySelector(".about").clientHeight * 100) / document.body.clientWidth + "vw";
		} else if (document.querySelector(".quoteContent").style.display != "none") {
			document.querySelector(".mobileBox").style.height = 30 + minMobileHeight + (document.querySelector(".quoteContent").clientHeight * 100) / document.body.clientWidth + "vw";
			document.querySelector(".georgeWrapper").style.top = 30 + minMobileHeight + (document.querySelector(".quoteContent").clientHeight * 100) / document.body.clientWidth + "vw";
		} else {

			document.querySelector(".mobileBox").style.height = minMobileHeight + "vw";
			document.querySelector(".georgeWrapper").style.top = minMobileHeight + "vw";
		}

		togglytog = true;
	} else if (togglytog == true) {
		document.querySelector(".georgeWrapper").style.top = "86vw";
		togglytog = false;

	}
}

//show in box stuff
function clearBox() {
	about.style.display = "none";
	page1Content.style.display = "none";
	page2Content.style.display = "none";
	page3Content.style.display = "none";
	page1.classList.remove('pageHover');
	page2.classList.remove('pageHover');
	page3.classList.remove('pageHover');
	name.style.color = "transparent";
	toggleAbout = true;
	togglePage1 = true;
	togglePage2 = true;
	togglePage3 = true;
	quoteContent.style.display = "none";
	toggleQuote = true;
}

name.onmouseover = function() {
	name.style.color = nameColor;
	if (toggleAbout == togglePage1 == togglePage2 == togglePage3 == true) {
		about.style.display = "block"
	}
};

name.onmouseout = function() {
	if (toggleAbout) {
		about.style.display = "none"
		name.style.color = "transparent";
	}
};

name.onclick = showAbout;
var toggleAbout = true;

function showAbout() {
	if (toggleAbout) {
		clearBox();
		quoteContent.style.display = "none";
		toggleQuote = true;
		quote.classList.remove('quoteAppear');
		name.style.color = " #00b3b3";
		about.style.display = "block"
		toggleAbout = false;
	} else {
		name.style.color = "transparent";
		about.style.display = "none"
		toggleAbout = true;

	}
}

//pages

page1.onmouseover = function() {
	page1.classList.add('pageHover');
};
page1.onmouseout = function() {
	if (togglePage1) {
		page1.classList.remove('pageHover');
	}
};

page1.onclick = showPage1;
var togglePage1 = true;

function showPage1() {
	if (togglePage1) {
		clearBox();
		page1.classList.add('pageHover');
		page1Content.style.display = "flex";
		quote.classList.add('quoteAppear');
		togglePage1 = false;
	} else {
		page1Content.style.display = "none";
		quoteContent.style.display = "none";
		toggleQuote = true;
		quote.classList.remove('quoteAppear');
		togglePage1 = true;

	}
}



page2.onmouseover = function() {
	page2.classList.add('pageHover');
};
page2.onmouseout = function() {
	if (togglePage2) {
		page2.classList.remove('pageHover');
	}
};

page2.onclick = showPage2;
var togglePage2 = true;

function showPage2() {
	if (togglePage2) {
		clearBox();
		page2.classList.add('pageHover');
		page2Content.style.display = "flex";
		quote.classList.add('quoteAppear');
		togglePage2 = false;
	} else {
		page2Content.style.display = "none";
		quote.classList.remove('quoteAppear');
		quoteContent.style.display = "none";
		toggleQuote = true;
		togglePage2 = true;

	}
}



page3.onmouseover = function() {
	page3.classList.add('pageHover');
};
page3.onmouseout = function() {
	if (togglePage3) {
		page3.classList.remove('pageHover');
	}
};

page3.onclick = showPage3;
var togglePage3 = true;

function showPage3() {
	if (togglePage3) {
		clearBox();
		page3.classList.add('pageHover');
		page3Content.style.display = "flex";
		quote.classList.add('quoteAppear');
		togglePage3 = false;
	} else {
		page3Content.style.display = "none";
		quote.classList.remove('quoteAppear');
		quoteContent.style.display = "none";
		toggleQuote = true;
		togglePage3 = true;

	}
}


quote.onclick = showQuote;
var toggleQuote = true;

function showQuote() {
	if (toggleQuote) {
		clearBox();
		quoteContent.style.display = "flex";
		toggleQuote = false;
	} else {
		quoteContent.style.display = "none";
		toggleQuote = true;

	}
}




var toggle123 = true;

const imgStuff = document.getElementsByClassName("imgStuff");
for (let i = 0; i < imgStuff.length; i++) {

	imgStuff[i].onclick = function() {
		enlargeImage(i);
	};
}


function enlargeImage(i) {
	if (toggle123) {
		if (document.body.clientWidth > mobileMinWidth)
			imgStuff[i].style.transform = "matrix( 4, 0, 0, 4," + ((document.body.clientWidth / 2) - (imgStuff[i].getBoundingClientRect().left + (imgStuff[i].getBoundingClientRect().width / 2))) + "," + ((document.documentElement.clientHeight / 2) - (imgStuff[i].getBoundingClientRect().top + (imgStuff[i].getBoundingClientRect().height / 2))) + ")";
		else

			imgStuff[i].style.transform = "matrix( 3, 0, 0, 3," + ((document.body.clientWidth / 2) - (imgStuff[i].getBoundingClientRect().left + (imgStuff[i].getBoundingClientRect().width / 2))) + "," + ((document.documentElement.clientHeight / 2) - (imgStuff[i].getBoundingClientRect().top + (imgStuff[i].getBoundingClientRect().height / 2))) + ")";
		document.querySelector(".iframeWatch").style.pointerEvents = null;
		imgStuff[i].id = "imageClick";
		toggle123 = false;
		setTimeout(function() {
			document.onclick = clearEnlargedImage;
		}, 100);

	} else {
		clearEnlargedImage();
	}
}

function clearEnlargedImage() {
	document.onclick = undefined;
	document.querySelector(".iframeWatch").style.pointerEvents = "none";
	for (let i = 0; i < imgStuff.length; ++i) {
		imgStuff[i].style.removeProperty('transform');
		setTimeout(() => {
			imgStuff[i].id = "";
		}, 400);
		toggle123 = true;
	}
}

//Aperature stuff
const apertureCanvas = document.getElementById('aperature');

const ctx = apertureCanvas.getContext('2d');

var apertureImg = new Image();
apertureImg.src = "/xd-ref/ApertureAnimation.png";

var aperture = {
	frame: 0,
	toggle: false,

};


window.onload = function() {
	ctx.drawImage(apertureImg, 559 * aperture.frame, 0, 559, 559, 0, 0, apertureCanvas.width, apertureCanvas.height);
};

document.querySelector(".whiteRing").onwheel = function(){if(aperture.frame == 0) requestAnimationFrame(update); window.event.preventDefault();};
//document.getElementById("aperature").onwheel = function(){if(aperture.frame == 0) requestAnimationFrame(update); window.event.preventDefault();};

function animateAperature(time) {


	if (aperture.toggle == false) {
		if (aperture.frame < 15) aperture.frame++;
		else {
			aperture.toggle = true;
			aperture.frame--;
		}
	} else {
		if (aperture.frame > 0) aperture.frame--;
		else {
			aperture.toggle = false;
			aperture.frame++;
		}
	}



	ctx.clearRect(0, 0, apertureCanvas.width, apertureCanvas.height);
	ctx.drawImage(apertureImg, 559 * aperture.frame, 0, 559, 559, 0, 0, apertureCanvas.width, apertureCanvas.height);

}

const FRAMES_PER_SECOND = 25; 

const FRAME_MIN_TIME = (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5;
var lastFrameTime = 0; // the last frame time

function update(time) {

	if (time - lastFrameTime < FRAME_MIN_TIME) { //skip the frame if the call is too early
		requestAnimationFrame(update);
		return; // return as there is nothing to do
	}
	lastFrameTime = time; // remember the time of the rendered frame

	animateAperature();

	if(aperture.frame > 0)
	requestAnimationFrame(update); // get next frame
}
