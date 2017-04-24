// Check "on" setting on start
chrome.windows.onCreated.addListener(function() {
 	chrome.storage.sync.get('enable', function(item) {
 		var flag;

 		// check previous state
 		if (typeof item.enable == 'undefined') 
 			flag = true;
 		else
 			flag = item.enable;
 		
 		// set icon for state
		if (!flag)
			chrome.browserAction.setIcon({path: "icons/icon_disabled.png"});
		else		
			chrome.browserAction.setIcon({path: "icons/icon16.png"});
 	});
})