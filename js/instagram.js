var collectedInstagramImages = [];
var downloadAsZip = true;
var output = [];
var mediaFiles = 0;


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
		html +=     '.instagram-extension-box {   position: fixed; bottom: 10px; right: 10px; width: 280px; background-color: white; border-radius: 3px; color: #5a5a5a; padding: 15px; text-align: center; border: 1px solid #e0e0e0; }';
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
		html +=     '<hr>';
		html +=     '<label><input type="checkbox" id="instagram-extension-box-download-as-zip" checked> Download as ZIP</label>';
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

	$('#instagram-extension-box-download-as-zip').on("click", function() {
		if (downloadAsZip) downloadAsZip = false;
		else downloadAsZip = true;
	});


	$('#instagram-extension-box-button-download').on("click", function() {

		var name = $('body').find('h1').html();

		// Download all images as ZIP file?
		if (downloadAsZip == true) {

			var downloadButtonText = $(this).html();
			$(this).html('Creating ZIP...');
			zipInstagramMedia(1, 'all', 1, collectedInstagramImages.length - 1);

			setTimeout(function() {
				$('#instagram-extension-box-button-download').html(downloadButtonText);
			}, 3000);

		} else {
			for (i in collectedInstagramImages) {
				var link = collectedInstagramImages[i];

				var a = $("<a>")
				    .attr("href", link)
				    .attr("download", name + ".jpg")
				    .appendTo("body");

				a[0].click();

				a.remove();
			}
		}

	});
});



///////////////////////////
//
// 	ZIP DATA
//
///////////////////////////

function zipInstagramMedia(cursor, type = 'all', start, end) {

    var url = "https://www.instagram.com"+window.location["pathname"]+"?max_id="+cursor;
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url);
    xhr.send(null);

    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4) {
            var doc = new DOMParser().parseFromString( xhr.response, "text/html");
            var a = doc.getElementsByTagName('script');
            var i = a[4].innerText.slice(20).slice(0, -1);
            var jsondata = JSON.parse(i);
            var currentData = jsondata.entry_data.ProfilePage[0].user.media;

            for (var i = 0; i < currentData.nodes.length; i++) {

                if (currentData.nodes[i].is_video) {
                    output.push(getVideo(currentData.nodes[i].code));
                } else {
                    output.push(currentData.nodes[i].display_src.split("?")[0]);
                }
                mediaFiles += 1;
            }

            if (currentData.page_info.has_next_page && mediaFiles <= end) {
                zipInstagramMedia(currentData.page_info.end_cursor, type, start, end);

            } else {
                if (start==1) start = 0;
                var newOutput = output.slice(start, end);
                
                if (newOutput.length > 0) {
                    createZipObject(newOutput, type, start, end);
                }
            }
        }
    }
}

function getVideo(code) {
    var url = "https://www.instagram.com/p/"+code+"/?hl=en";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    var doc = new DOMParser().parseFromString( xhr.response, "text/html");
    var a = doc.getElementsByTagName('script');
    var i = a[4].innerText.slice(20).slice(0, -1);
    var jsondata = JSON.parse(i);

    return jsondata.entry_data.PostPage[0].media.video_url;
}


function createZipObject(data, type, start, end){
    zip = JSZip();
    countCurList = data.length;
    var count = 0;
    for (var i=0;i<data.length;i++){
        count+=1;
        getBlob(data[i], i, type, start, end);
    }
}

function getBlob(url, last, type, start, end){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var defaultFileNameArray = url.split('/');
            var ending = "."+url.substring(url.length - 4).split(".")[1]
            var defaultFileName = last+"_"+defaultFileNameArray[defaultFileNameArray.length -1].split('.')[0] + ending
            zip.file(defaultFileName, xhr.response, {base64: true});
            countCurList-=1;

            if (countCurList == 0) {
                zip.generateAsync({type: "blob"}).then(function (content) {
                    saveAs(content, 'instagram_'+window.location["pathname"].replace("/", "").replace("/", "") +".zip");
                });
            }
        }
    };
    xhr.send();
}





// Download as ZIP

/*
	var zip = new JSZip();
	for (i in collectedInstagramImages) {
	  	console.log('adding to zip: ' + collectedInstagramImages[i]);
	  	var deferred = $.Deferred();

	  	JSZipUtils.getBinaryContent(collectedInstagramImages[i], function (err, data) {
		    if(err) {
		      alert("Problem happened when download img: " + collectedInstagramImages[i]);
		      console.error("Problem happened when download img: " + collectedInstagramImages[i]);
		      deferred.resolve(zip); // ignore this error: just logging
		      // deferred.reject(zip); // or we may fail the download
		    } else {
		      zip.file("picture"+i+".jpg", data, {binary:true});
		      deferred.resolve(zip);
		    }
	 	});
	}

	// Generate and save ZIP
	zip.generateAsync({type:"blob"})
	.then(function(content) {
	    saveAs(content, name + ".zip");
	});
*/



