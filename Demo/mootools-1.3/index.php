<!DOCTYPE html>
<html lang="it">

<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-type" content="text/html; charset=UTF-8" />
<meta name="author" content="FirebUntU, info@firebuntu.com" />
<title>MooVES 1.0 demo [Mootools 1.3+]</title>
<script type="text/javascript" src="mootools-1.3-core.js"></script>
<script type="text/javascript" src="mooves.js"></script>
<script type="text/javascript">
window.addEvent('domready', function(){

  $$('.player').each(function(element){
    new MooVES(element, {
      container: 'span',
      parse: 'text',
      proxy: '../mooves_proxy.php',
      width: 480,
      height: 325,
      background: '#cceeff',
      foreground: '#ff0179',
      hd: false,
      opacity: 0.75,
      html5: true
    });
   });
   
});
</script>
<style type="text/css">
* { margin:0; padding:0; }
body{ text-align:center; font:12px/1.4 Verdana, Geneva, Arial, Helvetica, sans-serif; }
#container{ width:1024px; margin:0 auto; padding:12px; background:#f3f6f6; }
.inline{ display:inline; float:left; width:480px; margin:16px; background:#666666; }
h1{ display:block; margin:10px 0; font-size:4em; letter-spacing:2px; color:#ffffff; text-shadow:#0183b7 1px 1px 5px; }
h1 sub{ font-size:25%; letter-spacing:1px; color:#0183b7; text-transform:uppercase; text-shadow:#ffffff 1px 1px 3px; }
h2{ display:block; margin:10px 20px; font-size:1.1em; color:#ffffff; text-shadow:#000000 1px 1px 3px; }
.mooves { float:left; clear:both; overflow:hidden; }
.mooves_preview{ position:relative; float:left; overflow:hidden; }
.mooves_overlay{ position:absolute; top:0; left:0; background:url(../player_btn.png) center center no-repeat; cursor:pointer; }
.clearer { clear:both; visibility:hidden; }
</style>
</head>

<body>

<p id="log"></p>
<div id="container">
	
	<h1>MooVES <sub>1.0</sub></h1>
	
	<p>The MooTools Video Enhancement System</p>

<?php
$grids = array(
  "youtube" => array("YouTube", "http://www.youtube.com/watch?v=eRsGyueVLvQ"),
  "vimeo" => array("Vimeo", "http://www.vimeo.com/2203727"),
  "dailymotion" => array("DailyMotion", "http://www.dailymotion.com/video/x4nhr_elephants-dream_creation"),
  "myplayer" => array("Your HTML5 Video", "http://mooves.firebuntu.com/videos/myvideo.flv")
);
?>

<?php foreach($grids as $grid=>$video){ ?>
	<div class="inline">
		<h2><?php echo $video[0] ?></h2>
		<div class="player">
			<span><?php echo $video[1] ?></span>
		</div>
	</div>
<?php } ?>

	<div class="clearer"></div>
	
	<p>I like too Mooves Mooves!</p>

</div>

</body>
</html>