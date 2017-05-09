/*
 * Change extension status - enable / disable
 * and save it
 */
function change() {
	if (!document.querySelector('input').checked) {
		chrome.browserAction.setIcon({path: "icons/icon_disabled.png"});
		chrome.storage.sync.set({'enable': false});
	}
	else {
		chrome.browserAction.setIcon({path: "icons/icon16.png"});		
		chrome.storage.sync.set({'enable': true});
	}
}
/*
 * Check state of input
 */
 function _init() {
 	chrome.storage.sync.get('enable', function(item) {
 		let flag;

 		// check previous state
 		if (typeof item.enable === 'undefined')
 			flag = true;
 		else
 			flag = item.enable;
 		
 		// set icon for state
		if (!flag)
			chrome.browserAction.setIcon({path: "icons/icon_disabled.png"});
		else		
			chrome.browserAction.setIcon({path: "icons/icon16.png"});

		document.querySelector('input').checked = flag;
 	});
 }

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('input').addEventListener('click', change);
	_init();
});