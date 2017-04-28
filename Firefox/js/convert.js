'use strict';

/**
 * Class for conversion
 */
class LSConvert {
	/**
	 * Constructor
	 */
	constructor(mode) {
		this.elem = {};
		this.mode = 0;
		this.page = '';

		var url = window.location.href;
		if (url.match(/.+user_detail\.cgi.+/g) != null) {
			this.elem = document.getElementsByTagName('center')[2];
			this.page = 'u';
		}
		else if (url.match(/.+topsites\.cgi.+/g) != null) {
			this.elem = document.getElementsByTagName('center')[1];
			this.page = 't';
		}
	}

	/**
	 * Set conversion mode
	 * @param {Number} mode Level of domain
	 */
	 setMode(mode) {
	 	if (typeof mode != 'number') this.mode = 0;
	 	this.mode = Math.floor(mode);
	 }

	/**
	 * Checking properties
	 * @return {Boolean} Success or not
	 */
	checkArgs() {
		if (this.elem.nodeType == 'undefined' || (this.page != 'u' && this.page != 'u') || typeof this.mode != 'number')
			return false;
		return true;
	}

	/**
	 * Get list of domains 
	 * @return {Object} Domains array
	 */
	getDomains() {
		if (!this.checkArgs()) return [];

		// basic definition & check working page
		var td1, td2;
		if (this.page == 'u') { td1 = 1; td2 = 3; }
		if (this.page == 't') { td1 = 2; td2 = 4; }
		
		var links = [], trs   = document.getElementsByTagName('tr'),
			tds, site, ip, count, temp, i;

		// get all sites from tr
		for (i in trs) {
			// check td existence
			if (typeof trs[i].getElementsByTagName !== 'function') continue;
			tds = trs[i].getElementsByTagName('td');

			// is td valid?
			if (typeof tds[td1] === 'undefined' || typeof tds[td1].getElementsByTagName !== 'function') continue;
			site = tds[td1].getElementsByTagName('a')[0];
			if (typeof site === 'undefined') continue;

			// it can be IP, not domain
			ip = site.innerHTML.match(/\d+\.\d+\.\d+\.\d+$/g);

			// get level of domain
			if (this.mode == 2)
				site = site.innerHTML.match(/[^\.]+\.[^\.]+$/g);
			else if (this.mode == 3) {
				temp = site.innerHTML.match(/[^\.]+\.[^\.]+\.[^\.]+$/g);
				if (temp == null)
					site = site.innerHTML.match(/[^\.]+\.[^\.]+$/g);
				else
					site = temp;
			}
			// site as is
			else
				site = [tds[td1].getElementsByTagName('font')[0].innerHTML]; // array for next checking

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
		var stat = [], sum = 0;
		for (site in links) {
			count = (links[site] / 1024 / 1024 / 1024).toFixed(2);
			stat.push({site: site, traffic: count});
			sum = Number(sum) + Number(count);
		}

		// sort & output
		stat.sort(function(a, b) {
			return b.traffic - a.traffic;
		})

		return [stat, sum];
	}

	/**
	 * Generate new stats makeup
	 */
	renderStats(){
		if (this.checkArgs()) {
			var add, html, header = "";

			if (this.mode == 2) header = browser.i18n.getMessage("sldheader");
			if (this.mode == 3) header = browser.i18n.getMessage("tldheader");

			add = document.createElement('div');
			add.setAttribute('id', 'stat-' + this.mode + 'dl');
			add.className = 'stat';

			var domains = this.getDomains(), links = domains[0];
			
			html   = '<div class="stat-sum">' +
				'	<div class="stat-sum-text">' + browser.i18n.getMessage("all") + '</div>' +
				'	<div class="stat-sum-number">' + domains[1].toFixed(2) +' GB</div>' +
				'</div>' +
				'<div class="stat-sites">' +
				'	<div class="stat-sites-head">' +
				'		<div class="stat-unit-number">№</div>' +
				'		<div class="stat-unit-domain">' + header + '</div>' +
				'		<div class="stat-unit-traffic">' + browser.i18n.getMessage("traffic") + '</div>' +
				'	</div>' +  
				'	<div class="stat-sites-list">';

			for (var i in links) {
				if (links[i].traffic != 0) {
					html = html + '	<div class="stat-unit">' +
						'		<div class="stat-unit-number">' + (Number(i) + Number(1)) + '</div>' +
						'		<div class="stat-unit-domain">' + links[i].site + '</div>' +
						'		<div class="stat-unit-traffic">' + links[i].traffic + ' GB</div>' +
						'	</div>';
				}
			}

			add.innerHTML = html + '</div></div></div>';
			this.elem.appendChild(add);
		}
	}
}

// Global var
var convert;

// Condition for work
browser.storage.sync.get('enable', function(item) {
	var flag;

	// check previous state
	if (typeof item.enable == 'undefined') 
		flag = true;
	else
		flag = item.enable;

	if (flag) {
		convert = new LSConvert();
		
		var	links, span;

		// create navigation div
		links  = document.createElement('div');
		links.setAttribute('id', 'stat-nav');

		// add first el
		span = document.createElement('span');
		span.className  += 'stat-sld';
		span.innerHTML   = browser.i18n.getMessage('sld');
		span.addEventListener('click', function(){
			var d2 = document.getElementById('stat-2dl'),
				d3 = document.getElementById('stat-3dl');
				
			convert.elem.getElementsByTagName('table')[0].className = 'elem-hide';

			if (d2 !== null) 
				d2.className = 'stat';
			else {
				convert.setMode(2);
				convert.renderStats();
			}

			if (d3 !== null)
				d3.className = 'elem-hide';
		});
		links.appendChild(span);

		// add second el
		span = document.createElement('span');
		span.className  += 'stat-tld';
		span.innerHTML   = browser.i18n.getMessage('tld');
		span.addEventListener('click', function(){
			var d2 = document.getElementById('stat-2dl'),
				d3 = document.getElementById('stat-3dl');

			convert.elem.getElementsByTagName('table')[0].className = 'elem-hide';

			if (d2 !== null) 
				d2.className = 'elem-hide';

			if (d3 !== null)
				d3.className = 'stat';				
			else {
				convert.setMode(3);
				convert.renderStats();
			}
		});
		links.appendChild(span);

		// add third el
		span = document.createElement('span');
		span.className  += 'stat-begin';
		span.innerHTML   = browser.i18n.getMessage('begin');
		span.addEventListener('click', function(){
			var d2 = document.getElementById('stat-2dl'),
				d3 = document.getElementById('stat-3dl');
				
			convert.elem.getElementsByTagName('table')[0].className = '';

			if (d2 !== null)
				d2.className = 'elem-hide';
			if (d3 !== null)
				d3.className = 'elem-hide';
		});
		links.appendChild(span);

		// add nav to page
		convert.elem.insertBefore(links, convert.elem.children[0]);
	}
});