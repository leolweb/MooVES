MooVES
======

MooVES is The MooTools Video Enhancement System, a plug-in for MooTools which allows a preview video from many video types. It supports also HTML5 video tag features (beta).

The plug-in is unobtrusive and displays the link to the video and a notice message when JavaScript or Adobe Flash Player are not enabled in the user's system.

The class is extensible, you can integrate other video sharing websites and network. It is completely customizable, thanks also to the advantage of an Open Source license.

![Screenshot](http://mooves.firebuntu.com/assets/images/mooves_logo.png)



How to Use
----------

This is a simple usage example. For more specific usage and options read the documentation at [http://mooves.firebuntu.com](http://mooves.firebuntu.com)


	#HTML

	<a id="player" href="http://www.youtube.com/watch?v=eRsGyueVLvQ">Sintel</a>


	#CSS

	.mooves { display:block }
	.mooves_preview { position:relative; display:block; overflow:hidden }
	.mooves_overlay { position:absolute; top:0; left:0; background:url(player_btn.png) center center no-repeat; cursor:pointer }


	#JS

	window.addEvent('domready', function(){
		var player = new MooVES($('player'), {
		      container: null,
		      parse: 'href',
		      proxy: 'mooves_proxy.php',
		      width: 480,
		      height: 360,
		      background: '#333333',
		      foreground: '#000000',
		      hd: true
		});
	});



Known issues
------------

Vimeo: HTML5 does not work without Flash installed

Blip.tv: HTML5 method does not work due to JavaScript errors


