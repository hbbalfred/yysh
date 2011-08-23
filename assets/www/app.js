/**
 * @author hbb
 */

Ext.setup({
	onReady: function ()
	{
		var watchid = null;
		
		var positions = [];
		
		var draw = function(){
			var ps = positions,
				i = 0,
				pts = [],
				map = viewport.down('#map').map,
				polyline;
				
			for(; i < ps.length; ++i){
				pts[i] = new BMap.Point( ps[i].coords.longitude, ps[i].coords.latitude );
			}
			
			if(pts.length == 0) return;
			
			polyline = new BMap.Polyline( pts, {
				strokeColor: 'blue',
				strokeWeight: 4,
				strokeOpacity: 0.5,
			});
			map.clearOverlays();
			map.addOverlay(polyline);
		};
		
		var report = function(){
			var ps = positions,
				str = '',
				i = 0;
			
			for(; i < ps.length; ++i){
				str += '(lat=' + ps[i].coords.latitude + ', lng=' + ps[i].coords.longitude + ')';
				str += '<br/>';
			}
			
			viewport.down('#message').update(str);
		};
		
		
		var viewport = new Ext.Panel({
			fullscreen: true,
			layout:{
				type:'card',
			},
			dockedItems:[
				{
					xtype:'toolbar',
					items:[
						{
							xtype:'button',
							text:'start',
							listeners:{
								tap:function(){
									// clear the old data
									positions.length = 0;
									// restore the latitude and longitude
									var currLat, currLng;
									var onSuccess = function(pos){
										pos.coords.latitude += Math.random() - Math.random() * 2;
										pos.coords.longitude += Math.random() - Math.random() * 2;
										positions.push(pos);
										console.log(positions.length);
										return;
										if(currLat == pos.coords.latitude
										&& currLng == pos.coords.longitude){
											return;
										}
										currLat = pos.coords.latitude;
										currLng = pos.coords.longitude;
										positions.push(pos);
									};
									var onError = function(err){
										alert('error.code: ' + err.code + '\nerror.message: ' + err.message);
									};
									watchid = navigator.geolocation.watchPosition(onSuccess, onError, { frequency: 3000 });
								}
							}
						},
						{
							xtype:'button',
							text:'stop',
							listeners:{
								tap:function(){
									if( watchid === null ) return;
									navigator.geolocation.clearWatch( watchid );
									watchid = null;
								}
							}
						},
						{
							xtype:'button',
							text:'map',
							listeners:{
								tap:function( btn, e ){
									if( btn.getText() === 'loc' ){
										viewport.setActiveItem(0);
										btn.setText('map');
										draw();
									}else{
										viewport.setActiveItem(1);
										btn.setText('loc');
										report();
									}
									
								}
							}
						}
					]
				}
			],
			items:[
				{
					xtype:'component',
					id:'message',
				},
				{
					xtype:'BaiduMap',
					id:'map',
				}
			]
		});
	}
});
	