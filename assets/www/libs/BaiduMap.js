/**
 * @author hbb
 * @class BaiduMap
 * @extends Ext.Map
 * 重载了一些使用 google map 的方法，不乏hack ticks -_-|||<br />
 * NOTE: 使用前需要先在index.html的head中预加载好 baidumap api <br />
 */

BaiduMap = Ext.extend( Ext.Map, {
	// default location shanghai people square
	PEOPLE_SQUARE:　{ longitude:121.47004, latitude:31.23136 }
	,
	/**
	 * @private 
	 * delegate handlers
	 */
	d_onZoom:null,
	d_onTypeChange:null,
	d_onCenterChange:null
	,
	/**
	 * @override
	 */
    initComponent: function()
    {
    	this.d_onZoom = Ext.createDelegate( this.onZoom, this );
    	this.d_onTypeChange = Ext.createDelegate( this.onTypeChange, this );
    	this.d_onCenterChange = Ext.createDelegate( this.onCenterChange, this );
            	
    	window.google = {maps: 'hacks for perform super.initComponent -  -||'};
        BaiduMap.superclass.initComponent.apply(this, arguments);
        delete window.google;
        
        if( !window.BMap ) this.html = '加载地图ing...';
        
    }
    ,
    /**
     * TODO...
     */
    loadMap: function()
    {
    	// forgot about it at the the present time -   -;
    	var script = document.createElement("script");
    	// script.async = false;
		script.src = "http://api.map.baidu.com/api?v=1.2&callback=";
		document.body.appendChild(script);
    }
    ,
    /**
     * TODO...
     */
    onResize: function( w, h )
    {
    	console.warn('so far do not supports resize');
    }
    ,
    /**
     * @override
     */
    renderMap : function()
    {
        var me = this,
            bm = window.BMap;
        
        if (bm) {
            if (Ext.is.iPad) {
                Ext.applyIf(me.mapOptions, {
                    navigationControlOptions: {
                        style: bm.NavigationControlType.BMAP_NAVIGATION_CONTROL_PAN
                    }
                });
            }
                
            Ext.applyIf(me.mapOptions, {
                center: new bm.Point( this.PEOPLE_SQUARE.longitude, this.PEOPLE_SQUARE.latitude ), 
                zoom: 15,
                mapType: BMAP_NORMAL_MAP
            });
            
            if (me.maskMap && !me.mask) {
                me.el.mask(null, this.maskMapCls);
                me.mask = true;
            }
    
            if (me.el && me.el.dom && me.el.dom.firstChild) {
                Ext.fly(me.el.dom.firstChild).remove();
            }
        
            if (me.map) {
            	me.map.removeEventListener( 'zoomend', me.d_onZoom );
            	me.map.removeEventListener( 'maptypechang', me.d_onTypeChange );
            	me.map.removeEventListener( 'moveend', me.d_onCenterChange );
            }
            
            me.map = new bm.Map(me.el.dom, me.mapOptions);
            me.map.centerAndZoom( me.mapOptions.center, me.mapOptions.zoom );
            me.map.addControl(new bm.NavigationControl());
            // TODO need develop a pinch event for device which not supporting such as android 
            
            me.map.addEventListener( 'zoomend', me.d_onZoom );
            me.map.addEventListener( 'maptypechange', me.d_onTypeChange );
            me.map.addEventListener( 'moveend', me.d_onCenterChange );
            
            me.fireEvent('maprender', me, me.map);
        }
    }
    ,
    /**
     * @override
     */
    onGeoUpdate : function( coords )
    {
    	console.log( 'on geo update, coords: {lat=' + coords.latitude + ', lng=' + coords.longitude +'}' );
        if (coords) {
            this.mapOptions.center = new BMap.Point( coords.longitude, coords.latitude );
        }
        
        if (this.rendered) {
            this.update( coords );
        } else {
            this.on('activate', this.onUpdate, this, {single: true, data: coords});
        }
    }
    ,
    /**
     * @override
     */
    update : function( coords ) 
    {
        var me = this, 
            bm = window.BMap;

        if (bm) {
            coords = coords || me.coords || { latitude: this.PEOPLE_SQUARE.latitude, longitude: this.PEOPLE_SQUARE.longitude };
            
            console.log( 'on map update, coords: {lat=' + coords.latitude + ', lng=' + coords.longitude +'}' );
            
            if (!me.hidden && me.rendered) {
                me.map || me.renderMap();
                if (me.map){
                   me.map.panTo( new bm.Point( coords.longitude, coords.latitude ) );
                }
            } else {
                me.on('activate', me.onUpdate, me, {single: true, data: coords});
            }
        }
    }
    ,
    /**
     * @override
     */
    onTypeChange  : function() 
    {
        this.mapOptions.mapType = this.map && this.map.getMapType 
            ? this.map.getMapType() 
            : this.mapOptions.mapType;
        
        this.fireEvent('typechange', this, this.map, this.mapOptions.mapType);
    }
    ,
    /**
     * @override
     */
    onDestroy : function()
    {
    	var me = this;
    	
        if ( me.map && window.BMap )
        {
			me.map.removeEventListener( 'zoomend', me.d_onZoom );
			me.map.removeEventListener( 'maptypechange', me.d_onTypeChange );
			me.map.removeEventListener( 'moveend', me.d_onCenterChange );
			
			me.map.clearOverlays();
        }
        
        BaiduMap.superclass.onDestroy.call(this);
    }
    ,
    /**
     * add markers on map
     * @params
     * 	markers - array of marker objects { longitude, latitude }
     */
    addMarkers: function( params )
    {
    	var me = this,
    		bm = window.BMap,
    		markers = params ? params.markers : null;
    		
    	if ( !bm ) return;
    	if ( !markers ) return;
    	
    	for (var i=0, ii=markers.length; i < ii; ++i)
    	{
    		var p = new bm.Point( markers[ i ].longitude, markers[ i ].latitude );
			me.map.addOverlay( new bm.Marker( p ) );
		}
    }
});

Ext.reg('BaiduMap', BaiduMap);
