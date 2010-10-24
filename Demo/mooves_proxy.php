<?php
/**
 * @script: proxy.php
 * @name: MooVES Proxy Thumbnailer
 * @description: A simple proxy thumbnailer for MooVES
 * @website: FirebUntU <http://www.firebuntu.com/>
 * @last-update: 2010-10-24
 * @version: 1.0
 *
 * @author: FirebUntU <info@firebuntu.com>
 * @copyright: 2010 Leonardo Laureti, <http://mooves.firebuntu.com/>
 * @license: MIT-style License <http://www.opensource.org/licenses/mit-license.php>
 *
 * @requires:
 * 	- PHP 5+
 * 	- simplexml
*/

error_reporting(0);
ini_set("allow_url_fopen", "on");
set_time_limit(2);

function error(){ echo "error"; }


if(isset($_GET["server"]) && isset($_GET["id"])){
	header('Content-Type: text/plain', 200);
	$id = $_GET["id"];
	switch($_GET["server"]){
		case "bliptv":
			$url = "http://blip.tv/rss/flash/".$id;
			$xml = simplexml_load_file($url, "SimpleXMLElement", LIBXML_NOCDATA);
			empty($xml) ? error() : $query = $xml->xpath("/rss/channel/item/media:thumbnail/@url");
			$thumbnail = "http://i.blip.tv/g?src=".substr($query[0]["url"], 1)."&w=320&h=240";
			break;
		case "flickr":
			$url = "http://www.flickr.com/apps/video/video_mtl_xml.gne?photo_id=".$id;
			$xml = simplexml_load_file($url, "SimpleXMLElement", LIBXML_NOCDATA);
			$query1 = $xml->Data->Item[2];
			$query2 = $xml->Data->Item[3];
			empty($xml) ? error() : $thumbnail = "http://farm".rand(1,5).".static.flickr.com/".$query1[0]."/".$id."_".$query2[0].".jpg";
			break;
		case "google":
			$url = "http://video.google.com/videofeed?docid=".$id;
			$xml = simplexml_load_file($url, "SimpleXMLElement", LIBXML_NOCDATA);
			empty($xml) ? error() : $query = $xml->xpath("/rss/channel/item/media:group/media:thumbnail/@url");
			$thumbnail = $query[0]["url"];
			break;
		case "megavideo":
			$url = "http://www.megavideo.com/v/".$id;
			$headers = get_headers($url, true);
			isset($headers) ? $location = preg_match("/image=([^\"]+)&/", $headers["location"], $thumbnail): error();		
			$thumbnail = $thumbnail[1];
			break;
		case "myspace":
      $url = "http://vids.myspace.com/index.cfm?fuseaction=oembed&url=http%3a%2f%2fwww.myspace.com%2findex.cfm%3ffuseaction%3dvids.individual%26videoId%3d".$id."&format=xml";
			$xml = simplexml_load_file($url, "SimpleXMLElement", LIBXML_NOCDATA);
			empty($xml) ? error() : $thumbnail = $xml->thumbnail_url;
			break;
		case "yahoo":
			$url = "http://proxy.api.video.yahoo.com/videoAPI/v1.0/Video.getDetails?PartnerID=YEP&ClientID=yvideo&Sig=yvideo&Proxy=1&ID=".$id;
			$xml = simplexml_load_file($url, "SimpleXMLElement", LIBXML_NOCDATA);
			empty($xml) ? error() : $query = $xml->VideoList->Video->Thumbnails->Thumbnail[1];
			$thumbnail = $query[0]["url"];
			break;
		case "vimeo":
			$url = "http://vimeo.com/api/clip/".$id."/php";
			$file = file_get_contents($url);
			empty($file) ? error() : $query = unserialize($file);
			$thumbnail = $query[0]["thumbnail_large"];
			break;
	}
	if(isset($thumbnail)) echo $thumbnail;
	else error();
}
?>
