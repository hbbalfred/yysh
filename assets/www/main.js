/**
 * @author hbb
 */

var AxeGangGame = {
	_keepid:null,
	_watchid:null,
	_positions:[],
	
	/**
	 * start watch position
	 * @param keepSec keep watching in the time(unit second), default is 1 hour
	 */
	startWatch:function(keepSec){
		var self = this;
		
		if(!keepSec) keepSec = 60 * 60;
		
		var onSuccess = function(position){
				console.log('new position(lat='+position.coords.latitude+', lng='+position.coords.longitude+')');
				AxeGangUI.game.down('#testMsg').update('new position(lat='+position.coords.latitude+', lng='+position.coords.longitude+')');
				if(currLat === position.coords.latitude
				|| currLng === position.coords.longitude){
					return;
				}
				currLat = position.coords.latitude;
				currLng = position.coords.longitude;
				self._positions.push( position );
			},
			onError = function(err){
				alert('Error:(code='+err.code+', message='+err.message+')');
			},
			options = {
				frequency: 3 * 1000,
				maximumAge: 3 * 1000,
				timeout: 10000,
				enableHighAccuracy: true,
			},
			currLat, currLng;
		
		this.stopWatch();
		this._positions = [];
		this._watchid = navigator.geolocation.watchPosition(onSuccess, onError, options);
		
		this._keepid = window.setTimeout(function(){
			self.stopWatch();
		}, keepSec * 1000);
	},
	/**
	 * stop watch
	 */
	stopWatch:function(){
		console.log('stop watch');
		if(this._keepid !== null){
			window.clearTimeout(this._keepid);
			this._keepid = null;
		}
		if(this._watchid !== null){
			navigator.geolocation.clearWatch(this._watchid);
			this._watchid = null;
		}
	},
	/**
	 * get watching positions
	 * @return a list of position
	 */
	getPositions:function(){
		return [
			{coords:{longitude:121.47004, latitude:31.23136}},
			{coords:{longitude:121.48004, latitude:31.2536}},
			{coords:{longitude:121.50004, latitude:31.26136}},
			{coords:{longitude:121.52004, latitude:31.30136}},
			{coords:{longitude:121.47004, latitude:31.24136}},
			{coords:{longitude:121.45004, latitude:31.25036}},
			{coords:{longitude:121.43004, latitude:31.27000}},
			{coords:{longitude:121.37004, latitude:31.28136}},
			{coords:{longitude:121.27004, latitude:31.26136}},
			{coords:{longitude:121.35004, latitude:31.24136}},
			{coords:{longitude:121.47004, latitude:31.23136}},
		];
		return this._positions;
	},
}; 

var AxeGangUI = {};


AxeGangUI.yysh = Ext.extend(Ext.Container, {
	
	initComponent: function() {
		var self = this;
		
        Ext.apply(this, {
            items:[
				{
					xtype:'container',
					layout:{
						type:'hbox',
					},
					items:[
						{
							xtype:'button',
							text:'start',
							id: 'btnStart',
							width:'50%',
							listeners:{
								tap: function(btn, e){
									AxeGangGame.startWatch();
									btn.setDisabled(true);
									self.down('#btnStop').setDisabled(false);
								}
							}
						},
						{
							xtype:'button',
							text:'stop',
							id:'btnStop',
							width:'50%',
							disabled:true,
							listeners:{
								tap: function(btn, e){
									AxeGangGame.stopWatch();
									btn.setDisabled(true);
									self.down('#btnStart').setDisabled(false);
								}
							}
						}
					]
				},
				{
					xtype:'component',
					id:'testMsg',
					html:'placeholder',
				}
			]
        });
        
        AxeGangUI.yysh.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('AxeGangUI.yysh', AxeGangUI.yysh);

Ext.setup({
	onReady: function(){
		var view = {
			me: new Ext.Container({
				iconCls:'user',
				title:'我',
				html:' placeholder'
			}),
			game: new Ext.Container({
				iconCls:'action',
				title:'游戏',
				items:[
					{
						xtype:'AxeGangUI.yysh',
						id:'yysh',
					}
				]
			}),
			map: new Ext.Container({
				iconCls:'maps',
				title:'地图',
				items:[
					{
						xtype:'BaiduMap',
						itemId:'mapCont',
					}
				],
				listeners:{
					show:function(){
						console.log('fff');
						var onSuccess = function(position){
							console.log(map);
							// map.panTo( new BMap.Point(position.coords.longitude, position.coords.latitude) );
							
							var ps = AxeGangGame.getPositions(),
								i = 0,
								pts = [],
								map = AxeGangUI.map.down('#mapCont').map,
								polyline;
								
							for(; i < ps.length; ++i){
								pts[i] = new BMap.Point( ps[i].coords.longitude, ps[i].coords.latitude );
							}
							
							map.clearOverlays();
							
							if(pts.length == 0) return;
							
							polyline = new BMap.Polyline( pts, {
								strokeColor: '#0000ff',
								strokeWeight: 6,
								strokeOpacity: 0.5,
							});
							map.addOverlay(polyline);
							
							
						},onError = function(err){
							alert('Error:(code='+err.code+', message='+err.message+')');
						},options = {
							enableHighAccuracy: true,
						};
						navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
						
						
					}
				}
			}),
		};
		
		Ext.apply(AxeGangUI, view);
		
		AxeGangUI.viewport = new Ext.TabPanel({
			fullscreen: true,
			tabBar:{
				dock: 'bottom',
				layout: { pack: 'center' }
			},
			items:[
				view.me,
				view.game,
				view.map,
			],
		});
	}
});
