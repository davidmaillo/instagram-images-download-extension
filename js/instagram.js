var collectedInstagramImages = [];


$(document).ready(function() {

	// Only apply it when URL is not Instagram's home:
	var url = document.location.href;
	var urlParts = url.split("/");

	if (urlParts[3] != "") {

		// Create menu on screen
		var box_title_text = 'Instagram download extension';
		var box_description_text = 'Scroll down the profile to make all photos visible, then collect the photos and simply download them in one click.';
		var html = '';

		// HTML for menu
		html += '<style>';
		html +=     '.instagram-extension-box {   position: fixed; bottom: 10px; right: 10px; width: 260px; background-color: white; border-radius: 3px; color: #5a5a5a; padding: 15px; text-align: center; border: 1px solid #e0e0e0; }';
		html +=     '.instagram-extension-box-button {   display: inline-block; background-color: #adadad; color: white; border-radius: 5px; padding: 10px; margin: 3px 0;}';
		html +=     '.instagram-extension-box-button.faded { background-color: #dedddd; }';
		html +=     '.instagram-extension-box-button:hover { background-color: #e2ba7b; cursor: pointer }';
		html +=     '#instagram-extension-box-title {   display: block; margin: 3px 0; font-weight:bold; }';
		html +=     '#instagram-extension-box-description {   display: block; margin: 6px 0; font-size: 11px; line-height: 1.4; }';
		html += '</style>';

		html += '<div class="instagram-extension-box">';
		html +=     '<span id="instagram-extension-box-title">' + box_title_text + '</span>';
		html +=     '<span id="instagram-extension-box-description">' + box_description_text + '</span>';
		html +=     '<span id="instagram-extension-box-button-collect" class="instagram-extension-box-button">Collect</span>';
		html +=     '<span id="instagram-extension-box-button-download" class="instagram-extension-box-button faded">Download photos</span>';
		html += '</div>';

		$('body').append(html);
	}


	///////////////////////////
	//
	//      COLLECT
	//
	///////////////////////////


	$('#instagram-extension-box-button-collect').on("click", function() {

		// Retrieve all IMG tags in HTML.
		$('body').find('img').each(function(index, value) {

			// Get image sources.
			imgSrc = value.src;

			// Collect all images in array.
			collectedInstagramImages.push(imgSrc);

			// Remove repeated image sources.
			collectedInstagramImages = jQuery.unique(collectedInstagramImages);

			// Get ID of images to edit them (display them as collected).
			imgId = $(this).attr('id');
			$('#'+imgId).css('opacity', 0.2);

			// Append a marker over the images that had been already collected.
			if (imgId != undefined) {

				imgPosition = $('#'+imgId).offset();

				if (imgPosition != undefined) {
					newMarkerId = 'instagram-extension-marker-'+ imgId;

					if ($("#" + newMarkerId).length == 0) {
						$('body').append('<div id="'+ newMarkerId +'" style="position: absolute; top: '+(imgPosition.top+4)+'px; left: '+(imgPosition.left+4)+'px; background-color: #444; border-radius: 25px; padding: 6px; font-size: 12px; color: white;">Collected</div>');
						$('#'+newMarkerId).fadeOut(4000, function() {
							$(this).remove();
						});
					}
				}
			}
		});

		// Update the downloader button with collected images counter
		$('#instagram-extension-box-button-download').text('Download ' + collectedInstagramImages.length + ' photos').removeClass('faded');
	});



	///////////////////////////
	//
	//      DOWNLOAD
	//
	///////////////////////////


	$('#instagram-extension-box-button-download').on("click", function() {

		// Convert image urls to links and auto-click to start download.
		var name = $('body').find('h1').html();

		for (i in collectedInstagramImages) {
			var link = collectedInstagramImages[i];

			var a = $("<a>")
			    .attr("href", link)
			    .attr("download", name + ".jpg")
			    .appendTo("body");

			a[0].click();

			a.remove();
		}
	});
});