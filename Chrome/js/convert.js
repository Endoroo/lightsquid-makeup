function convert() {
	// basic definition
	var url = window.location.href, td1, td2, ctr;
	if (url.match(/.+user_detail\.cgi.+/g) != null) { td1 = 1; td2 = 3; ctr = 2; }
	else if (url.match(/.+topsites\.cgi.+/g) != null) { td1 = 2; td2 = 4; ctr = 1; }
	else return;

	var links = [];
	var trs   = document.getElementsByTagName('tr'), tds, site, ip, count;
	for (var i in trs) {
		// check td existence
		if (typeof trs[i].getElementsByTagName !== "function") continue;
		tds = trs[i].getElementsByTagName('td');

		// get 2-level domain
		if (typeof tds[td1] === "undefined" || typeof tds[td1].getElementsByTagName !== "function") continue;
		site = tds[td1].getElementsByTagName('a')[0];
		if (typeof site === "undefined") continue;
		ip   = site.innerHTML.match(/\d+\.\d+\.\d+\.\d+$/g);
		site = site.innerHTML.match(/[^\.]+\.[^\.]+$/g);
		if (site != null) {
			if (ip != null)	site = ip[0]
			else site = site[0];

			site = site.replace(/:443/g,"");
			if (!links[site]) links[site] = 0;

			// get traffic count in bytes
			if (typeof tds[td2] === "undefined" || typeof tds[td2].getElementsByTagName !== "function") continue;
			count = tds[td2].getElementsByTagName('font')[0].innerHTML.replace(/\s/g,"");
			if (count.match("M") != null) {
					count = count.replace("M", "");
					count = count * 1024 * 1024;
				} else if (count.match("G") != null) {
					count = count.replace("G", "");
					count = count * 1024 * 1024 * 1024;
				}

			//save traffic count in bites			
			links[site] = Number(links[site]) + Number(count);
		}
	}

	// convert to array of objects
	stat = [], sum = 0;
	for (var site in links) {
		count = (links[site] / 1024 / 1024 / 1024).toFixed(2);
		stat.push({site: site, traffic: count});
		sum = Number(sum) + Number(count);
	}

	// sort & output
	stat.sort(function(a,b) {
		return b.traffic - a.traffic;
	})

	// replace table on page
	var center = document.getElementsByTagName('center')[ctr], html;
	html   = '<div class="stat"><div class="stat-sum">' +
		'	<div class="stat-sum-text">Всего</div>' +
		'	<div class="stat-sum-number">'+sum.toFixed(2)+' GB</div>' +
		'</div>' +
		'<div class="stat-sites">' +
		'	<div class="stat-sites-head">' +
		'		<div class="stat-unit-number">№</div>' +
		'		<div class="stat-unit-domain">Домен 2-го уровня или IP-адрес</div>' +
		'		<div class="stat-unit-traffic">Трафик</div>' +
		'	</div>' + 
		'	<div class="stat-sites-list">';

	for (var unit in stat) {
		if (stat[unit].traffic != 0) {
			html = html + '	<div class="stat-unit">' +
				'		<div class="stat-unit-number">' + (Number(unit) + Number(1)) + '</div>' +
				'		<div class="stat-unit-domain">' + stat[unit].site + '</div>' +
				'		<div class="stat-unit-traffic">' + stat[unit].traffic + ' GB</div>' +
				'	</div>';
		}
	}
	center.innerHTML = html + '</div></div></div></div>';
}

// condition for work
chrome.storage.sync.get('enable', function(item) {
		var flag;
		
 		// check previous state
 		if (typeof item.enable == 'undefined') 
 			flag = true;
 		else
 			flag = item.enable;

		if (flag) convert();
});