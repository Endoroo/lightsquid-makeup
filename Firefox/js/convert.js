/**
 * @todo functions to class
 * @todo getDomains mode 0 for convert original table with site as is
 */

/**
 * Get 2-3 level domain 
 * @param {Number} mode Level of domain
 * @param {String} page Proccessed page ID
 * @return {Object} Domains array
 */
function getDomains(mode, page){
	// Simple validation
	if (typeof mode != 'number' || typeof page != 'string') {
		console.error("function 'getDomains' type error");
		return [];
	}
	if (mode < 2 && mode > 3) {
		console.error("function 'getDomains' wrong mode");
		return [];
	}
	if (page.length > 1) page = page[0];

	// basic definition & check working page
	var td1, td2;
	if (page == 'u') { td1 = 1; td2 = 3; }
	else if (page == 't') { td1 = 2; td2 = 4; }
	else return [];

	var links = [];
	var trs   = document.getElementsByTagName('tr'), tds, site, ip, count, temp;
	for (var i in trs) {
		// check td existence
		if (typeof trs[i].getElementsByTagName !== 'function') continue;
		tds = trs[i].getElementsByTagName('td');

		// basic validation
		if (typeof tds[td1] === 'undefined' || typeof tds[td1].getElementsByTagName !== 'function') continue;
		site = tds[td1].getElementsByTagName('a')[0];
		if (typeof site === 'undefined') continue;

		// it can be IP, not domain
		ip = site.innerHTML.match(/\d+\.\d+\.\d+\.\d+$/g);

		// get level of domain
		if (mode == 2)
			site = site.innerHTML.match(/[^\.]+\.[^\.]+$/g);
		else if (mode == 3) {
			temp = site.innerHTML.match(/[^\.]+\.[^\.]+\.[^\.]+$/g);
			if (temp == null)
				site = site.innerHTML.match(/[^\.]+\.[^\.]+$/g);
			else
				site = temp;

		}
		// For mode 0 or others
		// site as is
		//else
			//site = [tds[td1].getElementsByTagName('font')[0].innerHTML]; // array for next checking

		if (site != null) {;
			if (ip != null)	site = ip[0]
			else site = site[0];

			site = site.replace(/:443/g,'');
			if (!links[site]) links[site] = 0;

			// get traffic count in bytes
			if (typeof tds[td2] === 'undefined' || typeof tds[td2].getElementsByTagName !== 'function') continue;
			count = tds[td2].getElementsByTagName('font')[0].innerHTML.replace(/\s/g,"");
			if (count.match('M') != null) {
					count = count.replace('M', '');
					count = count * 1024 * 1024;
				} else if (count.match('G') != null) {
					count = count.replace('G', '');
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
	stat.sort(function(a, b) {
		return b.traffic - a.traffic;
	})

	return links;
}

/**
 * Generate new stats view
 * @param {Object} elem  DOM element with original table
 * @param {Object} links Array domain or site links
 * @param {Number} mode  Stats view
 */
function view(elem, links, mode){
	// Simple validation
	if (typeof elem != 'object' || typeof links != 'object' || typeof mode != 'number') {
		console.error("function 'view' type error");
		return [];
	}
	if (mode !== 0 && mode !== 2 && mode !== 3) {
		console.error("function 'view' wrong mode");
		return [];
	}

	var add, html, header;
	if (mode == 2) header = browser.i18n.getMessage("sldheader");
	if (mode == 3) header = browser.i18n.getMessage("tldheader");

	add = document.createElement('div');
	add.setAttribute('id', 'stat-' + mode + 'dl');
	add.className = 'stat';
	
	html   = '<div class="stat-sum">' +
		'	<div class="stat-sum-text">' + browser.i18n.getMessage("all") + '</div>' +
		'	<div class="stat-sum-number">'+sum.toFixed(2)+' GB</div>' +
		'</div>' +
		'<div class="stat-sites">' +
		'	<div class="stat-sites-head">' +
		'		<div class="stat-unit-number">№</div>' +
		'		<div class="stat-unit-domain">' + header + '</div>' +
		'		<div class="stat-unit-traffic">' + browser.i18n.getMessage("traffic") + '</div>' +
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

	add.innerHTML = html + '</div></div></div>';
	elem.appendChild(add);
}

/**
 * Create new stats table
 * @param {Object} elem Element for conversion
 * @param {Number} mode Stats ID
 * @param {String} page Page ID
 * @return {Boolean} Success or not
 */
function convert(elem, mode, page = '') {
	// argument type validation
	if (typeof elem != 'object' || typeof mode != 'number' || typeof page != 'string') return false;

	var d2 = document.getElementById('stat-2dl'), d3 = document.getElementById('stat-3dl');
	switch (mode) {
		case 0:
			// set active default stats
			elem.getElementsByTagName('table')[0].className = '';

			if (d2 !== null)
				d2.className = 'elem-hide';
			if (d3 !== null)
				d3.className = 'elem-hide';
			break;
		case 2:
			// set active SLD stats
			elem.getElementsByTagName('table')[0].className = 'elem-hide';

			if (d2 !== null) 
				d2.className = 'stat';
			else {
				var links = getDomains(2, page);
				view(elem, links, 2);
			}

			if (d3 !== null)
				d3.className = 'elem-hide';

			break;
		case 3:
			// set active TLD stats
			elem.getElementsByTagName('table')[0].className = 'elem-hide';

			if (d2 !== null)
				d2.className = 'elem-hide';

			if (d3 !== null)
				d3.className = 'stat';
			else {
				var links = getDomains(3, page);
				view(elem, links, 3);
			}

			break;
		default:
			return false;
	}

	return true;
}

/*
 * Condition for work
 */
browser.storage.sync.get('enable', function(item) {
		var flag;
		
 		// check actual state
 		if (typeof item.enable == 'undefined') 
 			flag = true;
 		else
 			flag = item.enable;

		if (flag) {
			var url = window.location.href, center, ctr, page, links, span;

			// check page for action
			if (url.match(/.+user_detail\.cgi.+/g) != null) { ctr = 2; page = 'u'; }
			else if (url.match(/.+topsites\.cgi.+/g) != null) { ctr = 1; page = 't'; }
			else return;

			// create navigation
			center = document.getElementsByTagName('center')[ctr];
			links  = document.createElement('div');
			links.setAttribute('id', 'stat-nav');

			// add first el
			span = document.createElement('span');
			span.className  += 'stat-sld';
			span.innerHTML   = browser.i18n.getMessage('sld');
			span.addEventListener('click', function(){
				convert(center, 2, page);
			});
			links.appendChild(span);

			// add second el
			span = document.createElement('span');
			span.className  += 'stat-tld';
			span.innerHTML   = browser.i18n.getMessage('tld');
			span.addEventListener('click', function(){
				convert(center, 3, page);
			});
			links.appendChild(span);

			// add third el
			span = document.createElement('span');
			span.className  += 'stat-begin';
			span.innerHTML   = browser.i18n.getMessage('begin');
			span.addEventListener('click', function(){
				convert(center, 0);
			});
			links.appendChild(span);

			// add nav to page
			center.insertBefore(links,center.children[0]);
		}
});