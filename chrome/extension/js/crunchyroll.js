var style = document.createElement('style');

// refresh function
refresh = function(){
	window.dispatchEvent(new Event("resize"));
}

// remove Ads
removeAds = function(){
	var styleSheetRemoveAds = document.createElement('style');
	styleSheetRemoveAds.innerHTML = `
		#message_box {
			display: none !important;
		}
		.cr-expo-banner {
			display: none !important;
		}
		body {
			background-image: none !important;
			background: none !important;
		}
		#template_skin_leaderboard {
			height: 0 !important;
		}
		#template_skin_splashlink {
			pointer-events: none !important;
		}
		.__web-inspector-hide-shortcut__ {
			pointer-events: none !important;
		}
	`
	document.head.appendChild(styleSheetRemoveAds);
}

// set style as bigger player function
setStyleAsBiggerPlayer = function(){
	if (document.getElementById("main_content").contains(document.getElementById("showmedia_video"))) {
		document.getElementsByClassName("showmedia-trail cf")[0].appendChild(document.getElementById("showmedia_video"));
		document.getElementById("showmedia_video_box").id = "showmedia_video_box_wide";
	}
	style.innerHTML = `
		#showmedia, #footer {
			width: 960px !important;
			margin: 0 auto !important;
		}
		#showmedia_video {
			height: 100vh;
			background-color: black !important;
			width: 100% !important;
			min-width: 960px !important;
			min-height: 540px !important;
			max-height: 100vh !important;
		}
		#showmedia_video_box_wide {
			width: 100% !important;
			height: 100% !important;
		}
		#template_scroller {
			padding-top: 0px !important;
		}
		#template_container {
			padding: 0px !important;
			width: 100% !important;
		}
		#header_beta {
			display: none !important;
		}
		.showmedia-header:first-child {
			display: none !important;
		}
		.html5-video-player {
			width: 100% !important;
			height: 100% !important;
		}
		#vilos-player {
			width: calc(100% + 3px) !important;
			height: calc(100% + 1px) !important;
			margin-left: -3px !important;
			margin-top: -1px !important;
		}
		#showmedia_video_player {
			overflow: hidden !important;
		}
	`
}

// unset style function
unsetStyle = function(){ 
	style.innerHTML = ``
} 

// toggle video player
toggle = function(){
	// if large && in video page
	if (document.getElementById("main_content").className == "left" && document.getElementsByClassName("showmedia-trail cf")[0] != undefined) {
		setStyleAsBiggerPlayer();
	}
	else {
		unsetStyle();
	}
	setTimeout(refresh);
}

// togglerecursion function
toggleRecursion = function(){
	// if page is load
	if (document.getElementById("main_content") != null) {
		// laucnh cinema/normal switch function
		setTimeout(toggle);
	}
	else {
		// retry in 100ms
		setTimeout(toggleRecursion, 100);
	}
}

// launcher
launcher = function(){
	// add styleshett to document
	document.head.appendChild(style);
	// if there is ads
	setTimeout(removeAds);
	// if Crunchyroll HTML5 extension installed
	if (document.getElementsByClassName("chrome-button chrome-size-button")[0] != undefined) {
		document.getElementsByClassName("chrome-button chrome-size-button")[0].addEventListener("click", toggleRecursion);
	}
	setTimeout(toggleRecursion);
}

// START
chrome.storage.sync.get(['isCrunchyrollOff'], function(result){
	// if crunchyroll on
	if (!result.isCrunchyrollOff) {
		// lauch
		launcher();
	}
});
	