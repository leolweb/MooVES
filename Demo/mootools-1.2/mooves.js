/*
---
script: mooves.js
name: MooVES
decription: The MooTools Video Enhancement System
license: MIT-style license.
copyright: Copyright (c) 2010 [Leonardo Laureti](http://mooves.firebuntu.com/).
authors: FirebUntU (http://firebuntu.com/)
requires:
core:1.2.5:
- Class.Extras
- Element.Event
- Element.Style
- Swiff
- Fx.Morph
- Request
provides: [MooVES]
...
*/

Hash.extend({
  subset: function(keys){
    var results = {};
    for (var i = 0, l = keys.length; i < l; i++){
      var k = keys[i];
      results[k] = this[k];
    }
    return results;
  }
});

var MooVES = new Class({
	Implements: Options,

  options:{
    container: null,
    parse: 'href',
    proxy: 'mooves_proxy.php',
    autostart: false,
    width: 640,
    height: 360,
    wmode: 'opaque',
    background: '#333333',
    foreground: '#999999',
    opacity: 0.8,
    autoplay: true,
    hd: false,
    fullscreen: true,
    loop: false,
    minFlashVersion: 9,
    noFlashContent: ['div', 'No Flash Player installed!'],
    noThumbnail: 'no_thumb.jpg',
    html5: false //beta
  },

  initialize: function(item, options){
    this.setOptions(options);
		this.item = $(item);
		
		if($defined(this.options.container)) this.url = this.item.getElement(this.options.container).get(this.options.parse);
		else this.url = this.item.get(this.options.parse);
			
		this.background = this.options.background.replace(/^#+/,'');
		this.foreground = this.options.background.replace(/^#+/,'');
		this.UID = Date.now();

		if($defined(this.url)){
			this.data = this.provider();
			if($defined(this.data)) this.build(this.data);
		}
	},
	
	provider: function(){},
	
	uniqueID: function(){
    return (this.UID++).toString(36);
  },
	
	getThumbnail: function(id, server){
		var request = new Request({
			method: 'get',
			async: false,
			url: this.options.proxy,
			data: {
				server: server,
				id: id
			},
			onSuccess: function(response){
				this.response = response;
			}.bind(this),
			onFailure: function(xhr) {
				this.response = null;
			}.bind(this)
		}, this).send();
		return this.response;
	},

	object: function(data){
		var object = new Swiff(data.flash, {
			id: 'mooves_swiff_' + data.id,
			width: data.width,
			height: data.height,
			properties: {
				menu: false
			},
			params: {
				wMode: this.options.wmode,
				bgcolor: (this.options.wmode=='transparent')?'':this.options.background,
				allowFullscreen: this.options.fullscreen,
				allowScriptAccess: 'always',
				quality: 'best'
			},
			vars: (data.flashvars)?data.flashvars:{},
			styles: {border: 0, outline: 'none'}
		});
		return object;
	},
	
	html5_video: function(data, ext){
		switch(data.html5_method){
			case 'native':
				if($type(data.html5_src)=='object') var source = data.html5_src.subset([ext[0]]);
				else var source = data.html5_src;
				var video = new Element('video', {
					id: 'mooves_video_' + this.uniqueID(),
					src: Object.values(source)[0]['src'],
					width: data.width,
					height: data.height,
					controls: true,
					autoplay: this.options.autoplay?true:false,
					styles: {border: 0, outline: 'none'}
				});
				if($type(data.html5_src)=='object'){
					data.html5_src.each(function(source){
						new Element('source', {src: source.src, type: source.type}).inject(video);
					});
				}
				break;
			case 'iframe':
				var video = new Element('iframe', {
					id: 'mooves_iframe_' + data.id,
					type: 'text/html',
					width: data.width,
					height: data.height,
					src: data.html5_src,
					frameborder: 0,
					styles: {border: 0, outline: 'none'}
				});
				break;
		  case 'script':
		    var video = new Element('span', {
		      id: 'mooves_js_' + data.id,
		      html: '<script type="text/javascript" src="' + data.html5_src + '"></script>'
		    });
		    break;
			default:
				var video = false;
		};
		return video;
	},

	preview: function(data){
	  this.item.empty();
		var opacity = this.options.opacity;
		var player_preview = new Element('a', {
			'class': 'mooves_preview',
			'styles': {
        width: data.width,
        height: data.height,
        background: this.options.background,
        cursor: 'pointer'
      },
			'events': {
				mouseenter: function(){
					this.morph({duration: 200, 'opacity': 1});
				},
				mouseleave: function(){
					this.morph({duration: 200, 'opacity': opacity});
				},
				click: function(){
					this.show();
				}.bind(this)
			},
			'opacity': opacity
		}).inject(this.item);		
		var player_img = new Element('img', {
			src: (!data.thumbnail || data.thumbnail=='error')?this.options.noThumbnail:data.thumbnail,
			width: data.width,
			height: data.height,
			galleryimg: 'no',
			styles: {
				'image-rendering': 'optimizeQuality',
				'-ms-interpolation-mode': 'bicubic'
			}
		});
		var player_overlay = new Element('span', {
			'class': 'mooves_overlay',
			'styles': {width: data.width, height: data.height}
		});
		player_preview.adopt([player_img, player_overlay]);
	},
	
	build: function(data){
	  this.item.empty();
		this.item = new Element('div', {
			'id': 'mooves_' + this.uniqueID(),
			'class': 'mooves',
			'styles': {width: data.width, height: data.height, background: this.options.background}
		}).replaces(this.item);
		this.options.autostart ? this.show() : this.preview(data);
	},
	
	show: function(){
	  this.item.empty();
	  var ext = this.html5_check(this.data.html5_ext);
		if(this.options.html5 && ext){
		  this.html5_video(this.data, ext).inject(this.item);
		} else {
      if(Browser.Plugins.Flash.version > this.options.minFlashVersion){
        this.object(this.data).inject(this.item);
      } else {
        new Element(this.options.noFlashContent[0], {'html': this.options.noFlashContent[1]}).inject(this.item);
      }
    }
	},
	
	html5_check: function(ext){
		var video = new Element('video');
    var check = [];
    if(ext && video.canPlayType){
		  if(ext.contains('webm') && video.canPlayType('video/webm; codecs="vp8, vorbis"')) check.push('webm');
		  if(ext.contains('mp4') && video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) check.push('mp4');
		  if(ext.contains('ogg') && video.canPlayType('video/ogg; codecs="theora, vorbis"')) check.push('ogg');
		}
		if(check != 0) return check;
	}
});


/* YouTube */
MooVES = new Class({
	Extends: MooVES,
	provider: function(){
		this.parent();
		var YouTube = function(){
			if(this.url.match(/youtube\.com\/watch/i)) return this.YouTube();
		}.bind(this);
		$extend(this, YouTube());
		return this;
	},
	YouTube: function(){
		var id = this.url.split('v=');
		var autoplay = this.options.autoplay?1:0;
		var fullscreen = this.options.fullscreen?1:0;
		var loop = this.options.loop?1:0;
		switch(this.options.hd){
			case '720':
				var vd = 'hd720';
				var hd = true;
				break;
			case '1080':
				var vd = 'hd1080';
				var hd = true;
				break;
			default:
				var vd = 'auto';
				var hd = false;
		};
		var data = {
			id: id[1],
			flash: 'http://www.youtube.com/v/' + id[1] + '?rel=0',
			thumbnail: 'http://i.ytimg.com/vi/' + id[1] + '/hqdefault.jpg',
			width: this.options.width,
			height: this.options.height,
			flashvars: {
				autoplay: autoplay,
				fs: fullscreen,
				vd: vd,
				hd: this.options.hd?1:0,
				showinfo: 0,
				showsearch: 0,
				rel: 0,
				color1: '0x'+this.background,
				color2: '0x'+this.foreground,
				loop: loop
			},
			html5_method: 'iframe',
			html5_ext: ['webm','mp4'],
			html5_src: 'http://www.youtube.com/embed/' + id[1] + '?rel=0&autoplay=' + autoplay + '&loop=' + loop + '&vd=' + vd
		};
		if(this.options.html5){
		  new Element('iframe', {id: 'mooves_yt_html5', src: 'http://www.youtube.com/html5?enable_html5=true'}).inject(document.body, 'bottom');
		  $('mooves_yt_html5').destroy();
		};
		return data;
	}
});

/* Vimeo */
MooVES = new Class({
	Extends: MooVES,
	provider: function(){
		this.parent();
		var Vimeo = function(){
			if(this.url.match(/vimeo\.com\//i)) return this.Vimeo();
		}.bind(this);
		$extend(this, Vimeo());
		return this;
	},
	Vimeo: function(){
		var id = this.url.split('/');
		var autoplay = this.options.autoplay?1:0;
		var fullscreen = this.options.fullscreen?1:0;
		var hd = this.options.hd?0:1;
		var loop = this.options.loop?1:0;
		var data = {
			id: id[3],
			flash: 'http://vimeo.com/moogaloop.swf',
			thumbnail: this.getThumbnail(id[3], 'vimeo'),
			width: this.options.width,
			height: this.options.height,
			flashvars: {
				clip_id: id[3],
				autoplay: autoplay,
				hd_off: hd,
				server: 'vimeo.com',
				show_title: 0,
				show_byline: 0,
				show_portrait: 0,
				loop: loop,
				color: this.foreground,
				fullscreen: fullscreen
			},
			html5_method: 'iframe',
			html5_ext: ['mp4'],
			html5_src: 'http://player.vimeo.com/video/' + id[3] + '?title=0&byline=0&portrait=0&loop=' + loop + '&autoplay=' + autoplay
		};
		return data;
	}
});


/* DailyMotion */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var DailyMotion = function(){
      if(this.url.match(/dailymotion\./i)) return this.DailyMotion();
    }.bind(this);
    $extend(this, DailyMotion());
    return this;
  },
  DailyMotion: function(){
    var id = this.url.split('/');
    var autoplay = this.options.autoplay?1:0;
    var options = '&amp;autoPlay='+autoplay+'&amp;colors=background:'+this.background+';glow:'+this.background+';foreground:'+this.foreground+';special:'+this.background;
    var data = {
      id: id[4].split('_')[0],
      flash: 'http://www.dailymotion.com/swf/' + id[4].split('_')[0] + options,
      thumbnail: 'http://www.dailymotion.com/thumbnail/320x240/video/' + id[4],
      width: this.options.width,
      height: this.options.height,
      flashvars: {},
      html5_method: 'iframe',
      html5_ext: ['ogg','mp4'],
      html5_src: 'http://www.dailymotion.com/embed/video/'+id[4].split('_')[0]+'?width='+this.options.width+'&theme=none&foreground=%23'+this.foreground+'&highlight=%23'+this.background+'&background=%23'+this.foreground+'&start=0&animatedTitle=&iframe=1&additionalInfos=0&autoPlay='+autoplay+'&hideInfos=0'
    };
    return data;
  }
});

/* blip.tv */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var blip = function(){
      if(this.url.match(/blip\.tv/i)) return this.blip();
    }.bind(this);
    $extend(this, blip());
    return this;
  },
  blip: function(){
    var id = this.url.split('/');
    var autoplay = this.options.autoplay?true:false;
    var data = {
      id: id[4],
      flash: 'http://a.blip.tv/scripts/flash/showplayer.swf',
      thumbnail: this.getThumbnail(id[4], 'bliptv'),
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        file: 'http://blip.tv/rss/flash/' + id[4],
        source: 1,
        use_direct: 1,
        use_documents: 1,
        enablejs: true,
        autostart: autoplay,
        staggerLoad: true
      }/*,
      //NOT WORKS
      html5_method: 'script',
      html5_ext: ['ogg','mp4'],
      html5_src: 'http://blip.tv/play/' + id[4] + '.js?width=' + this.options.width + '&height=' + this.options.height + '&autostart=' + autoplay*/
    };
    return data;
  }
});

/* facebook */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var facebook = function(){
      if(this.url.match(/facebook\.com/i)) return this.facebook();
    }.bind(this);
    $extend(this, facebook());
    return this;
  },
  facebook: function(){
    var id = this.url.split('v=');
    var data = {
      id: id[0],
      flash: 'http://www.facebook.com/v/' + id[0],
      thumbnail: this.getThumbnail(id[0], 'facebook'),
      width: this.options.width,
      height: this.options.height,
      flashvars: {}
    };
    return data;
  }
});

/* Flickr */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var Flickr = function(){
      if(this.url.match(/flickr\.com/i)) return this.Flickr();
    }.bind(this);
    $extend(this, Flickr());
    return this;
  },
  Flickr: function(){
    var id = this.url.split('/');
    var no_autoplay = this.options.autoplay?false:true;
    var data = {
      id: id[5],
      flash: 'http://www.flickr.com/apps/video/stewart.swf?v=' + id[5],
      thumbnail: this.getThumbnail(id[5], 'flickr'),
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        photo_id: id[5],
        flickr_noAutoPlay: no_autoplay, //NOT WORKS
        flickr_show_info_box: false
      }
    };
    return data;
  }
});

/* Google Video */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var GoogleVideo = function(){
      if(this.url.match(/google\.com\/videoplay/i)) return this.GoogleVideo();
    }.bind(this);
    $extend(this, GoogleVideo());
    return this;
  },
  GoogleVideo: function(){
    var id = this.url.split('=');
    var autoplay = this.options.autoplay?1:0;
    var fullscreen = this.options.fullscreen?1:0;
    var data = {
      id: id[1],
      flash: 'http://video.google.it/googleplayer.swf',
      thumbnail: this.getThumbnail(id[1], 'google'),
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        docid: id[1],
        autoplay: autoplay,
        fs: fullscreen
      }
    };
    return data;
  }
});

/* MEGAVIDEO */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var Megavideo = function(){
      if(this.url.match(/megavideo\.com/i)) return this.Megavideo();
    }.bind(this);
    $extend(this, Megavideo());
    return this;
  },
  Megavideo: function(){
    var id = this.url.split('v/');
    var hd = this.options.hd?1:0;
    var thumbnail = this.getThumbnail(id[1], 'megavideo');
    var data = {
      id: id[1].substr(0, 8),
      flash: 'http://wwwstatic.megavideo.com/mv_player.swf',
      thumbnail: thumbnail,
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        v: id[1].substr(0, 8),
        image: thumbnail,
        hd: hd
      }
    };
    return data;
  }
});

/* Metacafe */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var Metacafe = function(){
      if(this.url.match(/metacafe\.com\/watch/i)) return this.Metacafe();
    }.bind(this);
    $extend(this, Metacafe());
    return this;
  },
  Metacafe: function(){
    var id = this.url.split('/');
    var autoplay = this.options.autoplay?'yes':'none';
    var options = '?playerVars=showStats=no|autoPlay=' + autoplay + '|';
    var data = {
      id: id[4],
      flash: 'http://www.metacafe.com/fplayer/' + id[4] + '/' + id[5] + '.swf' + options,
      thumbnail: 'http://www.metacafe.com/thumb/' + id[4] + '.jpg',
      width: this.options.width,
      height: this.options.height,
      flashvars: {}
    };
    this.options.wmode = 'transparent';
    return data;
  }
});

/* MySpace.tv */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var MySpaceTV = function(){
      if(this.url.match(/myspacetv\.com|vids\.myspace\.com/i)) return this.MySpaceTV();
    }.bind(this);
    $extend(this, MySpaceTV());
    return this;
  },
  MySpaceTV: function(){
    var id = this.url.split('=');
    var autoplay = this.options.autoplay?1:0;
    var data = {
      id: id[2],
      flash: 'http://mediaservices.myspace.com/services/media/embed.aspx',
      thumbnail: this.getThumbnail(id[2], 'myspace'),
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        m: id[2],
        ap: autoplay,
        t: 1,
        mt: 'video'
      }
    };
    this.options.wmode = 'transparent';
    return data;
  }
});

/* MSN Video */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var MSN = function(){
      if(this.url.match(/video\.msn\.com/i)) return this.MSN();
    }.bind(this);
    $extend(this, MSN());
    return this;
  },
  MSN: function(){
    var id = this.url.split('vid=');
    var autoplay = this.options.autoplay?true:false;
    var fullscreen = this.options.fullscreen?true:false;
    var data = {
      id: id[1],
      flash: 'http://images.video.msn.com/flash/customPlayer/1_0/customPlayer.swf',
      thumbnail: 'http://img4.catalog.video.msn.com/image.aspx?uuid=' + id[1].replace(/[^a-zA-Z0-9]+/g, '') + '&w=320&h=240',
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        'player.v': id[1],
        'player.ap': autoplay,
        'player.fullscreen': fullscreen,
        configCsid: 'msnvideo',
        configName: 'syndicationplayer'
      }     
    };
    this.options.wmode = 'transparent';
    return data;
  }
});

/* TwitVid */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var TwitVid = function(){
      if(this.url.match(/twitvid\.com/i)) return this.TwitVid();
    }.bind(this);
    $extend(this, TwitVid());
    return this;
  },
  TwitVid: function(){
    var id = this.url.split('/');
    var data = {
      id: id[3],
      flash: 'http://www.twitvid.com/player/' + id[3],
      thumbnail: 'http://images.twitvid.com/' + id[3] + '.jpg',
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        autostart: this.options.autoplay,
        fullscreenbutton: this.options.fullscreen,
        rotatevideo: false,
        style_color: this.options.foreground
      }
    };
    return data;
  }
});

/* USTREAM */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var Ustream = function(){
      if(this.url.match(/ustream\.tv/i)) return this.Ustream();
    }.bind(this);
    $extend(this, Ustream());
    return this;
  },
  Ustream: function(){
    var id = this.url;
    var autoplay = this.options.autoplay?1:0;
    var data = {
      id: id,
      flash: 'http://www.ustream.tv/flash/video/' + id,
      thumbnail: 'http://img.ustream.tv/vi/' + id + '/0.jpg',
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        usViewers: true,
        autoplay: autoplayYouTube
      }     
    };
    this.options.wmode = 'transparent';
    return data;
  }
});

/* Yahoo! Video */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var YahooVideo = function(){
      if(this.url.match(/yahoo\.com/i)) return this.YahooVideo();
    }.bind(this);
    $extend(this, YahooVideo());
    return this;
  },
  YahooVideo: function(){
    var id = this.url.split('/');
    var autoplay = this.options.autoplay?1:0;
    var thumbnail = this.getThumbnail(id[4], 'yahoo');
    var data = {
      id: id[4],
      flash: 'http://d.yimg.com/static.video.yahoo.com/yep/YV_YEP.swf?ver=2.2.46',
      thumbnail: thumbnail,
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        id: id[5],
        vid: id[4],
        thumbUrl: thumbnail,
        autoplay: autoplay,
        embed: 1
      }
    };
    return data;
  }
});


/* MyPlayer */
MooVES = new Class({
  Extends: MooVES,
  provider: function(){
    this.parent();
    var MyPlayer = function(){
      if(this.url.match(/mooves\.local/i)) return this.MyPlayer();
    }.bind(this);
    $extend(this, MyPlayer());
    return this;
  },
  MyPlayer: function(){
    var video = this.url.split('/')[3].split('.')[0];
    var autoplay = this.options.autoplay?1:0;
    var data = {
      flash: '/assets/swiff/player_flv_mini_0.2.1.swf',
      thumbnail: '/assets/videos/' + video + '.jpg',
      width: this.options.width,
      height: this.options.height,
      flashvars: {
        flv: this.url,
        width: this.options.width,
        height: this.options.height,
        autoplay: autoplay,
        buffer: 10,
        playercolor: this.foreground
      },
      html5_method: 'native',
      html5_ext: ['webm','ogg','mp4'],
      html5_src: {
        'mp4': {
          src: '/assets/videos/' + video + '.mp4',
          type: 'video/mp4'
        },
        'webm': {
          src: '/assets/videos/' + video + '.webm',
          type: 'video/webm'
        },
        'ogg': {
          src: '/assets/videos/' + video + '.ogv',
          type: 'video/ogg'
        }
      }
    };
    return data;
  }
});
