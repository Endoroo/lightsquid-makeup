/*
 * Enable / disable action
 *
 * For working temp install setting ID of addon in manifest.json is needed
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/WebExtensions_and_the_Add-on_ID#When_do_you_need_an_Add-on_ID
 */
browser.browserAction.onClicked.addListener(function() {	
	browser.storage.sync.get('enable', function(item) {
		// error handling (e.g. for temp install) 
		if (browser.runtime.lastError) {
			console.error(browser.runtime.lastError);
		} else {
			var flag;

			// get actual state
			if (typeof item.enable == 'undefined') 
				flag = true;
			else
				flag = item.enable;
			
			// change state & icon
			if (flag) {
				browser.browserAction.setIcon({path: "icons/icon-off.svg"});
				browser.storage.sync.set({'enable': false});
			}
			else {
				browser.browserAction.setIcon({path: "icons/icon-on.svg"});
				browser.storage.sync.set({'enable': true});
			}
		}
	});		
});