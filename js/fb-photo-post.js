// This bit is important.  It detects/adds XMLHttpRequest.sendAsBinary.  Without this
// you cannot send image data as part of a multipart/form-data encoded request from
// Javascript.  This implementation depends on Uint8Array, so if the browser doesn't
// support either XMLHttpRequest.sendAsBinary or Uint8Array, then you will need to
// find yet another way to implement this. (This is left as an exercise for the reader,
// but if you do it, please let me know and I'll integrate it.)

// from: http://stackoverflow.com/a/5303242/945521

if ( XMLHttpRequest.prototype.sendAsBinary === undefined ) {
    XMLHttpRequest.prototype.sendAsBinary = function(string) {
        var bytes = Array.prototype.map.call(string, function(c) {
            return c.charCodeAt(0) & 0xff;
        });
        this.send(new Uint8Array(bytes).buffer);
    };
}

// This function takes an array of bytes that are the actual contents of the image file.
// In other words, if you were to look at the contents of imageData as characters, they'd
// look like the contents of a PNG or GIF or what have you.  For instance, you might use
// pnglib.js to generate a PNG and then upload it to Facebook, all from the client.
//
// Arguments:
//   authToken - the user's auth token, usually from something like authResponse.accessToken
//   filename - the filename you'd like the uploaded file to have
//   mimeType - the mime type of the file, eg: image/png
//   imageData - an array of bytes containing the image file contents
//   message - an optional message you'd like associated with the image

function PostImageToFacebook( authToken, filename, mimeType, imageData, message )
{
    // this is the multipart/form-data boundary we'll use
    var boundary = '----ThisIsTheBoundary1234567890';
    
    // let's encode our image file, which is contained in the var
    var formData = '--' + boundary + '\r\n'
    formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
    formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
    for ( var i = 0; i < imageData.length; ++i )
    {
        formData += String.fromCharCode( imageData[ i ] & 0xff );
    }
    formData += '\r\n';
    formData += '--' + boundary + '\r\n';
    formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
    formData += message + '\r\n'
    formData += '--' + boundary + '--\r\n';
    
    var xhr = new XMLHttpRequest();
    xhr.open( 'POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true );
    xhr.onload = xhr.onerror = function() {
        console.log( xhr.responseText );
    };
    xhr.setRequestHeader( "Content-Type", "multipart/form-data; boundary=" + boundary );
    xhr.sendAsBinary( formData );
}