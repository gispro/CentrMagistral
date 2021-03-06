﻿var m1 = null;
var dpi = 96;
var eu1 = 'Images/empty.png';
var glp1 = null;
var moscow = new google.maps.LatLng(55.748758, 37.6174);
var sp1 = null;
var sb1 = null;
var ls = [];
var ms = [];
var lastDiff = 0;
var dp1 = null;
var ir1 = false;
var smd1 = new Date();
var im1 = null;
var lm1 = null;
var sm1 = null;
var vd1 = null;

Ext.setup({
    tabletStartupScreen: 'Images/tablet_startup.png',
    phoneStartupScreen: 'Images/phone_startup.png',
    icon: 'Images/icon.png',
    glossOnIcon: false,
    onReady: function () {
        
        dpi = document.getElementById('dpi').offsetWidth;
        if (Ext.supports.GeoLocation) {
            glp1 = (navigator.geolocation ? navigator.geolocation :
                (window.google || {}).gears ? google.gears.factory.create('beta.geolocation') : null);
        }

        var options = {
            zoom: 8,
            center: moscow,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: '',
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN],
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            }
        }

        sb1 = new Ext.Button({
            iconCls: 'settings',
            handler: function (btn, event) { getTopSettings().showBy(btn); }
        });

        toolbar = new Ext.Toolbar({
            dock: 'top',
            xtype: 'toolbar',
            ui: 'light',
            defaults: {
                iconMask: true
            },
            items: [
                {
                    iconCls: 'locate',
                    handler: function () {
                        if (glp1 != null)
                            glp1.getCurrentPosition(function (position) {
                                if (lm1 != null)
                                    lm1.setMap(null);
                                lm1 = new google.maps.Marker({
                                    zIndex: 1000,
                                    icon: 'Images/location.png',
                                    position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                                    map: m1.map
                                });
                                m1.map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                                m1.map.setZoom(17);
                            });
                    }
                },
                {
                    iconCls: 'search',
                    handler: function (btn, event) { getSearch().showBy(btn); }
                },
                { xtype: 'spacer' },
                sb1
            ]
        });

        m1 = new Ext.Map({ mapOptions: options });

        new Ext.Panel({
            fullscreen: true,
            dockedItems: [toolbar],
            items: [m1]
        });

        ls['remont'] = new gmaps.ags.MapOverlay(remontLayerUrl);
        ls['poi_bus_a'] = new gmaps.ags.MapOverlay(busLayerUrl);

        google.maps.event.addListener(m1.map, 'mousedown', function (event) {
            smd1 = new Date();
        });
        google.maps.event.addListener(m1.map, 'dragstart', function (event) {
            smd1 = new Date(1990, 1, 1);
        });
        google.maps.event.addListener(m1.map, 'zoom_changed', function (event) {
            //document.title = m1.map.getZoom();
            smd1 = new Date(1990, 1, 1);
        });
        google.maps.event.addListener(m1.map, 'mouseup', function (event) {
            if (ir1 || (new Date()).getTime() - smd1.getTime() > 500)
                return;
            vd1 = null;
            im1 = new google.maps.Marker({
                zIndex: 1000,
                icon: 'Images/tapping.png',
                position: event.latLng,
                map: m1.map
            });
            ir1 = true;
            showProgress();
            var tolerance = 10;
            if (m1.map.getZoom() <= 15)
                tolerance = 20;
            else if (m1.map.getZoom() <= 8)
                tolerance = 30;
            var display = screen.width + ',' + screen.height + ',' + dpi;
            Ext.util.JSONP.request({
                url: identityUrl,
                callbackKey: 'callback',
                params: {
                    geometryType: 'esriGeometryPoint',
                    geometry: event.latLng.lng() + ',' + event.latLng.lat(),
                    layers: 'all',
                    tolerance: tolerance,
                    mapExtent: m1.map.getBounds().toUrlValue(),
                    imageDisplay: display,
                    returnGeometry: false,
                    f: 'pjson'
                },
                callback: oiy
            });
        });

        Ext.util.JSONP.callback = function(json) {
            try {
                this.current.callback.call(this.current.scope, json);
            } catch(e) {
            }

            document.getElementsByTagName('head')[0].removeChild(this.current.script);
            this.next();
        };

        m1.map.mapTypes.set("ArcGIS", new gmaps.ags.MapType(mapUrl, {name: 'ArcGIS'}) );
        window.setTimeout(function() { 
            m1.map.setMapTypeId("ArcGIS"); 
        }, 3000);
    }
});

function getpi(poiName) {
    switch(poiName) {
        default:
        case 'meteo': return 0;
        case 'video': return 1;
        case 'sensors': return 2;
        case 'poi_azs': return 3;
        case 'poi_bus': return 4;
        case 'poi_food': return 5;
        case 'poi_otdyh': return 6;
        case 'poi_shop': return 7;
        case 'poi_sto': return 8;
        case 'poi_wash': return 9;
   }
}

function shm(poiName) {
    if (ms[poiName] == null) {
        Ext.util.JSONP.request({
            url: 'GeoData.ashx',
            callbackKey: 'callback',
            params: { source: poiName },
            callback: Ext.util.Functions.createDelegate(ogms, { poiName: poiName })
        });
    } else if (ms[poiName] != null) {
        if (ms[poiName].state) {
            for (var i = 0; i < ms[poiName].visible.length; i++) 
                    ms[poiName].visible[i].setVisible(false);
        } else
            sms(poiName);
        ms[poiName].state = !ms[poiName].state;
    }
}

function gmd() {
    if (m1.map.getZoom() < 7)
        return 0.07;
    if (m1.map.getZoom() < 10)
        return 0.05;
    else if (m1.map.getZoom() == 10)
        return 0.01;
    else if (m1.map.getZoom() <= 15)
        return 0.005;
    else if (m1.map.getZoom() <= 20)
        return 0.0000000005;
}

function sms(poiName) {
    var diff = 0;//gmd();
    ms[poiName].visible.length = 0;
    for (var i = 0; i < ms[poiName].markers.length; i++) {
        var show = true;
        for (var j = 0; j < ms[poiName].visible.length; j++) {
            if (Math.abs(ms[poiName].markers[i].getPosition().lat() - ms[poiName].visible[j].getPosition().lat()) < diff
            && Math.abs(ms[poiName].markers[i].getPosition().lng() - ms[poiName].visible[j].getPosition().lng()) < diff)
            show = false;
        }
        ms[poiName].markers[i].setVisible(show);
        if (show)
            ms[poiName].visible.push(ms[poiName].markers[i]);
    }
}

function rms() {
    var diff = gmd();
    if (lastDiff == diff)
        return;
    for (var ind in ms) {
        if (ms[ind].state && ms[ind].markers.length > 50) {                
            if (lastDiff > diff && ms[ind].markers.length == ms[ind].visible.lrngth) 
                continue;
            sms(ind);
        }
    }
    lastDiff = diff;
}

function ogms(result) {
    if (result.error != null) {
        alert('Ошибка при получении данных о слое!');
        return;
    }
    ms[this.poiName] = { state: false, markers: [], visible: [] };
    for (var i = 0; i < result.features.length; i++) {
        var coord = new google.maps.LatLng(result.features[i].geometry.y, result.features[i].geometry.x);
        var marker = new google.maps.Marker({
            icon: 'Images/Markers/' + this.poiName + '.png',
            position: coord,
            flat: true,
            raiseOnDrag: false,
            clickable: false,
            optimized: true,
            visible: false,
            map: m1.map
        });
        ms[this.poiName].markers[i] = marker;                        
    }
    shm(this.poiName);
}

function oiy(result) {
    hideProgress();
    im1.setMap(null);
    ir1 = false;
    var objects = {};
    var roadId = null;
    var km = null;
    for (var i = 0; i < result.results.length; i++) {
        if (result.results[i].layerId == 10) {
            roadId = result.results[i].attributes.Kroad;
            break;
        }
    }
    for (var i = 0; i < result.results.length; i++) {
        if (result.results[i].layerId == 11 && roadId == result.results[i].attributes.Kroad) {
            km = parseFloat(result.results[i].attributes.km.replace(',', '.'));
            break;
        }
    }
    
    for (var i = 0; i < result.results.length; i++) {
        if (roadId == null)
            roadId = result.results[i].attributes.Kroad;
        switch(result.results[i].layerId){
            case 0: 
                if (roadId == result.results[i].attributes.Kroad) {
                    var mkm = parseFloat(result.results[i].attributes.station_pos.replace(',', '.'));
                    if (objects.meteo == null) 
                        objects.meteo = { id: result.results[i].attributes.KStation, km: mkm };
                    else if (Math.abs(objects.meteo.km - km) > Math.abs(mkm - km))
                        objects.meteo = { id: result.results[i].attributes.KStation, km: mkm };
                }
                break;
            case 1: 
                if (roadId == result.results[i].attributes.Kroad) {
                    var vkm = parseFloat(result.results[i].attributes.camera_pos.replace(',', '.'));
                    if (objects.video == null)
                        objects.video = { id: result.results[i].attributes.Kcamera, road: result.results[i].attributes.camera_name, km: vkm };
                    else if (Math.abs(objects.video.km - km) > Math.abs(vkm - km))
                        objects.video = { id: result.results[i].attributes.Kcamera, road: result.results[i].attributes.camera_name, km: vkm };
                }
                break;
            case 2: 
                if (roadId == result.results[i].attributes.Kroad) {
                    var skm = parseFloat(result.results[i].attributes.sensor_pos.replace(',', '.'));
                    if (objects.speed == null)
                        objects.speed = { id: result.results[i].attributes.Ksensor, km: skm };
                    else if (Math.abs(objects.speed.km - km) > Math.abs(skm - km))
                        objects.speed = { id: result.results[i].attributes.Ksensor, km: skm };
                }
                break;
            case 3: 
                if (objects.services == null && roadId == result.results[i].attributes.Kroad)
                    objects.services = [];
                if (roadId == result.results[i].attributes.Kroad)
                    objects.services.push({ layer: result.results[i].layerId, layerName: result.results[i].layerName, 
                        km: parseFloat(result.results[i].attributes.azs_pos.replace(',', '.')), name: result.results[i].attributes.azs_name, dir: result.results[i].attributes.axis_name });
                break;
            case 4:
                if (objects.services == null && roadId == result.results[i].attributes.Kroad)
                    objects.services = [];
                if (roadId == result.results[i].attributes.Kroad)
                    objects.services.push({ layer: result.results[i].layerId, layerName: result.results[i].layerName, 
                        km: parseFloat(result.results[i].attributes.bus_pos.replace(',', '.')), name: result.results[i].attributes.bus_name, dir: result.results[i].attributes.axis_name });
                break;
            case 5:
                if (objects.services == null && roadId == result.results[i].attributes.Kroad)
                    objects.services = [];
                if (roadId == result.results[i].attributes.Kroad)
                    objects.services.push({ layer: result.results[i].layerId, layerName: result.results[i].layerName, 
                        km: parseFloat(result.results[i].attributes.food_pos.replace(',', '.')), name: result.results[i].attributes.food_name, dir: result.results[i].attributes.axis_name });
                break;
            case 6:
                if (objects.services == null && roadId == result.results[i].attributes.Kroad)
                    objects.services = [];
                if (roadId == result.results[i].attributes.Kroad)
                    objects.services.push({ layer: result.results[i].layerId, layerName: result.results[i].layerName, 
                        km: parseFloat(result.results[i].attributes.otdyh_pos.replace(',', '.')), name: 'Места отдыха', dir: result.results[i].attributes.axis_name });
                break;
            case 7:
                if (objects.services == null && roadId == result.results[i].attributes.Kroad)
                    objects.services = [];
                if (roadId == result.results[i].attributes.Kroad)
                    objects.services.push({ layer: result.results[i].layerId, layerName: result.results[i].layerName, 
                        km: parseFloat(result.results[i].attributes.shop_pos.replace(',', '.')), name: result.results[i].attributes.shop_name, dir: result.results[i].attributes.axis_name });
                break;
            case 8:
                if (objects.services == null && roadId == result.results[i].attributes.Kroad)
                    objects.services = [];
                if (roadId == result.results[i].attributes.Kroad)
                    objects.services.push({ layer: result.results[i].layerId, layerName: result.results[i].layerName, 
                        km: parseFloat(result.results[i].attributes.sto_pos.replace(',', '.')), name: result.results[i].attributes.sto_name, dir: result.results[i].attributes.axis_name });
                break;
            case 9:
                if (objects.services == null && roadId == result.results[i].attributes.Kroad)
                    objects.services = [];
                if (roadId == result.results[i].attributes.Kroad)
                    objects.services.push({ layer: result.results[i].layerId, layerName: result.results[i].layerName, 
                        km: parseFloat(result.results[i].attributes.wash_pos.replace(',', '.')), name: result.results[i].attributes.wash_name, dir: result.results[i].attributes.axis_name });
                break;
            case 10:
                objects.common = objects.common != null ? objects.common : {};
                if (objects.common.roadId == null && roadId == result.results[i].attributes.Kroad) {
                    objects.common.roadId = result.results[i].attributes.Kroad;
                    objects.common.roadShifr = result.results[i].attributes.Shifr;
                }
                break;
            case 11:
                objects.common = objects.common != null ? objects.common : {};
                if (objects.common.km1 == null && roadId == result.results[i].attributes.Kroad) {
                    objects.common.km1 = result.results[i].attributes.km;
                    objects.common.km2 = result.results[i].attributes.km2;
                    objects.common.dir1 = result.results[i].attributes.Direction1;
                    objects.common.dir2 = result.results[i].attributes.Direction2;
                }
                break;
            case 12: 
                break;
            case 13: 
                break;
            case 14: 
                objects.common = objects.common != null ? objects.common : {};
                if ((objects.common.dtp == null || objects.common.dtp < result.results[i].attributes.dtp_danger) && roadId == result.results[i].attributes.Kroad) {
                    objects.common.dtp = result.results[i].attributes.dtp_danger;
                    objects.common.dtpName = result.results[i].attributes.danger_t;
                }
                break;
        }
    }
    if (objects.common != null && objects.common.roadId != null && km != null) 
        sinw(objects);
    else 
        getNoInfo().show();
}

function gdos() {
    var panelOptions = {
        floating: true,
        centered: true,
        modal: true,
        hideOnMaskTap: false
    };
    panelOptions.width = Math.min(screen.width, 300);
    panelOptions.height = Math.min(screen.height, 380);

    return panelOptions;
}

function sinw(objects) {
    var buttons = [];
    if (objects.common != null)
        buttons.push({ icon: 'Images/Tabs/common.png', iconCls: 'tabIcon', pressed: true, handler: Ext.util.Functions.createDelegate(oncmcl, objects.common) });
    if (objects.meteo != null)
        buttons.push({ icon: 'Images/Tabs/meteo.png', iconCls: 'tabIcon', pressed: buttons.length == 0, handler: Ext.util.Functions.createDelegate(omec, { common: objects.common, meteo: objects.meteo }) });
    if (objects.video != null) 
        buttons.push({ icon: 'Images/Tabs/video.png', iconCls: 'tabIcon', pressed: buttons.length == 0, handler: Ext.util.Functions.createDelegate(ovic, objects.video) });
    if (objects.speed != null)
        buttons.push({ icon: 'Images/Tabs/speed.png', iconCls: 'tabIcon', pressed: buttons.length == 0, handler: Ext.util.Functions.createDelegate(ospc, objects.speed) });
    if (objects.common != null)
        buttons.push({ icon: 'Images/Tabs/remont.png', iconCls: 'tabIcon', pressed: buttons.length == 0, handler: Ext.util.Functions.createDelegate(orrc1, objects.common) });
    if (objects.services != null)
        buttons.push({ icon: 'Images/Tabs/service.png', iconCls: 'tabIcon', pressed: buttons.length == 0, handler: Ext.util.Functions.createDelegate(ossc1, { common: objects.common, services: objects.services} ) });

    var panelOptions = gdos();
    var segment = [{
        xtype: 'segmentedbutton',
        allowDepress: true,
        items: buttons
    }];
    var toolbar = new Ext.Toolbar({
        ui: 'light',
        dock: 'top',
        items: [ {xtype: 'spacer'}, segment, {xtype: 'spacer'} ]
    })
    panelOptions.dockedItems = [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: objects.common.roadShifr + ', ' + objects.common.km1 + '-й км',
                        height: 40,
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                if (Ext.util.JSONP.queue.length == 0 && Ext.util.JSONP.current == null) {
                                    dlg.hide(); 
                                    dlg.destroy();
                                }
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
                    ,toolbar
                    ];
    dp1 = new Ext.Panel();
    panelOptions.items = [ dp1 ];
    (new Ext.Panel(panelOptions)).show();    
    buttons[0].handler();
}

function omec() {
    lvp1 = null;
    Ext.util.JSONP.request({
        url: 'Data.ashx',
        callbackKey: 'callback',
        params: { source: 'meteodata', id: this.meteo.id },
        callback: Ext.util.Functions.createDelegate(ogmed, this)
    });
}

function ogmed(result) {
    var tColor = 'blue';
    if (result.Temp > 0)
        tColor = "red";
    var windName = "S";
    switch (result.WindDirection) {
        case 'СВ': windName = 'SV'; break;
        case 'В': windName = 'V'; break;
        case 'ЮВ': windName = 'UV'; break;
        case 'Ю': windName = 'U'; break;
        case 'ЮЗ': windName = 'UZ'; break;
        case 'З': windName = 'Z'; break;
        case 'СЗ': windName = 'SZ'; break;
    }
    Ext.getDom('meteo_img').src = 'Images/Meteo/' + result.ImageName;
    Ext.getDom('meteo_tmp').style.color = tColor;
    Ext.getDom('meteo_tmp').innerHTML = result.TempName;
    Ext.getDom('meteo_time').innerHTML = result.Time;
    Ext.getDom('meteo_road_state1').innerHTML = gdfl(result.Surface1);
    Ext.getDom('meteo_road_state2').innerHTML = gdfl(result.Surface2);
    Ext.getDom('meteo_road_dir1').innerHTML = gdfl(this.common.dir1);
    Ext.getDom('meteo_road_dir2').innerHTML = gdfl(this.common.dir2);
    Ext.getDom('meteo_wind_dir').innerHTML = result.WindDirection;
    Ext.getDom('meteo_wind_speed').innerHTML = result.WindSpeed;
    Ext.getDom('meteo_wind_speed_max').innerHTML = result.WindSpeedMax;
    dp1.removeAll();
    dp1.add(new Ext.Panel({ html: Ext.getDom('meteo').innerHTML }));
    dp1.doLayout();
}

var cvin = 0;
function ovic() {
    lvp1 = null;
    if (vd1 == null) {    
        Ext.util.JSONP.request({
            url: 'Data.ashx',
            callbackKey: 'callback',
            params: { source: 'image', id: this.id, from: (new Date()).getTime(), offset: (new Date()).getTimezoneOffset() },
            callback: Ext.util.Functions.createDelegate(ongetvd, { id: this.id })
        });
    } 
    {
        dp1.removeAll();
        Ext.getDom('video_road').innerHTML = this.road;
        dp1.add(new Ext.Panel({ html: Ext.getDom('video').innerHTML }));
        dp1.doLayout();
    }
}

function ongetvd(result) {
    if (vd1 == null) {
        vd1 = [];
        cvin = 0;
    }
    for(var i = 0; i < result.length; i++)
        vd1.push(result[i]);
    if (cvin >= vd1.length)
        cvin = vd1.length - 1;
    svii();
}

function onSwipe(targetId, direction) {
    if (targetId == 'video') {
        switch(direction) {
            case 'left':
                cvin++;
                svii(direction);
                break;
            case 'right':
                cvin--;
                svii(direction);
                break;
        }
    } else if (targetId == 'services') {
        onServiceNext(direction);
    }
}

var lvp1 = null;
function svii(dir) {
    if (cvin < 0)
        cvin = 0;
    if (cvin >= vd1.length && vd1.length > 0) {
        Ext.util.JSONP.request({
            url: 'Data.ashx',
            callbackKey: 'callback',
            params: { source: 'image', id: vd1[vd1.length - 1].kcamera, from: vd1[vd1.length - 1].load_time.getTime() },
            callback: Ext.util.Functions.createDelegate(ongetvd, { id: vd1[vd1.length - 1].kcamera, dir: dir })
        });
    } else {
        if (lvp1 != null) {
            Ext.Anim.run(lvp1, 'fade',
            {
                scope: lvp1,
                after: function () {
                    this.hide();
                    sevii();
                }
            });
        } else 
            sevii();        
    }
}

function sevii() {
    dp1.removeAll();
    Ext.getDom('video_img').src = vd1[cvin].image;
    Ext.getDom('video_time').innerHTML = vd1[cvin].load_timeStr;
    lvp1 = new Ext.Panel({ html: Ext.getDom('video').innerHTML, listeners : { swipe : function(c) { alert(c.direction); } } });
    dp1.add(lvp1);
    dp1.doLayout();
}

function ospc() {
    lvp1 = null;
    dp1.removeAll();
    dp1.doLayout();
    Ext.util.JSONP.request({
        url: 'Data.ashx',
        callbackKey: 'callback',
        params: { source: 'speed', id: this.id },
        callback: Ext.util.Functions.createDelegate(ogspd, { id: this.id })
    });
}

var cusn1 = 0;
var currDay = 1;
var haveR = false;
var haveL = false;

function ogspd(result) {
    currDay = (new Date()).getDay();
    currDay = currDay == 0 ? 7 : currDay;
    cusn1 = this.id;
    haveR = false;
    haveL = false;

    Ext.getDom('speed_now_l').innerHTML = '';
    Ext.getDom('speed_name_l').innerHTML = '';
    Ext.getDom('speed_name2_l').innerHTML = '';
    Ext.getDom('speed_km_l').innerHTML = '';
    Ext.getDom('speed_now_r').innerHTML = '';
    Ext.getDom('speed_name_r').innerHTML = '';
    Ext.getDom('speed_name2_r').innerHTML = '';
    Ext.getDom('speed_km_r').innerHTML = '';
    if (result != null && result.speedName_L != null && result.speedName_L != '') {
        Ext.getDom('speed_now_l').innerHTML = result.speed_L;
        Ext.getDom('speed_now_l').style.color = gspcl(result.speed_L);
        Ext.getDom('speed_name_l').innerHTML = result.speedName_L;
        Ext.getDom('speed_name2_l').innerHTML = result.speedName_L;
        Ext.getDom('speed_km_l').innerHTML = ' км/ч';
        haveL = true;
    } 
    if (result != null && result.speedName_R != null && result.speedName_R != '') {
        Ext.getDom('speed_now_r').innerHTML = result.speed_R;
        Ext.getDom('speed_now_r').style.color = gspcl(result.speed_R);
        Ext.getDom('speed_name_r').innerHTML = result.speedName_R;
        Ext.getDom('speed_name2_r').innerHTML = result.speedName_R;
        Ext.getDom('speed_km_r').innerHTML = (haveL ? '' : ' км/ч');
        haveR = true;
    } 
    updy();
}

function gspcl(speed) {
    if (speed <= 50)
        return '#FF0000';
    else if (speed <= 60)
        return '#FFAA00';
    else if (speed <= 70)
        return '#FFFF00';
    else if (speed <= 90)
        return '#AAFF00';
    else 
        return '#4CE600';
}

function updy() {
    switch (currDay) {
        case 1:
            Ext.getDom('speed_day').innerHTML = 'ПОНЕДЕЛЬНИК';
            break;
        case 2:
            Ext.getDom('speed_day').innerHTML = 'ВТОРНИК';
            break;
        case 3:
            Ext.getDom('speed_day').innerHTML = 'СРЕДА';
            break;
        case 4:
            Ext.getDom('speed_day').innerHTML = 'ЧЕТВЕРГ';
            break;
        case 5:
            Ext.getDom('speed_day').innerHTML = 'ПЯТНИЦА';
            break;
        case 6:
            Ext.getDom('speed_day').innerHTML = 'СУББОТА';
            break;
        case 7:
            Ext.getDom('speed_day').innerHTML = 'ВОСКРЕСЕНЬЕ';
            break;
    }
    if (haveL)
        Ext.getDom('speed_usualy_l').src = 'Images/Sensors/b/' + cusn1 + '_' + currDay + '_b.png';
    else
        Ext.getDom('speed_usualy_l').src = eu1;
    if (haveR)
        Ext.getDom('speed_usualy_r').src = 'Images/Sensors/a/' + cusn1 + '_' + currDay + '_a.png';
    else
        Ext.getDom('speed_usualy_r').src = eu1;
    dp1.removeAll();
    dp1.add(new Ext.Panel({ html: Ext.getDom('speed').innerHTML }));
    dp1.doLayout();
}

function nextSpeedDay() {
    currDay = currDay == 7 ? 1 : (currDay + 1);
    updy();
}

function prevSpeedDay() {
    currDay = currDay == 1 ? 7 : (currDay - 1);
    updy();
}

function oncmcl() {
    lvp1 = null;
    Ext.getDom('common_km1').innerHTML = this.km1 == null ? ('') : (this.km1 + '-й км');
    Ext.util.JSONP.request({
        url: 'Data.ashx',
        callbackKey: 'callback',
        params: { source: 'common', id: this.roadId, km: this.km1 },
        callback: Ext.util.Functions.createDelegate(ogcndt, { maker: this })
    });
}

function gdfl(str, defStr) {
    return (str == null || str == '' || str == 'Null') ? (defStr == null ? 'Н/Д' : defStr) : str;
}

function split(str, separator) {
    var arr = str.split(separator);
    result = arr[0];
    for(var i = 1; i < arr.length; i++) 
        result += ('<br />' + arr[i]);
    return result;
}

function ogcndt(result) {
    Ext.getDom('common_road').innerHTML = gdfl(result.RoadName);
    Ext.getDom('common_service').innerHTML = gdfl(result.ServiceName);
    Ext.getDom('common_service_phone').innerHTML = split(gdfl(result.ServicePhone, ''), ',');
    Ext.getDom('common_service_km').innerHTML = gdfl(result.ServiceKm, '');
    Ext.getDom('common_gibdd').innerHTML = gdfl(result.GIBDDName);
    Ext.getDom('common_gibdd_address').innerHTML = gdfl(result.GIBDDAddress, '');
    Ext.getDom('common_gibdd_phone').innerHTML = split(gdfl(result.GIBDDPhone, ''), ',');

    dp1.removeAll();
    dp1.add(new Ext.Panel({ html: Ext.getDom('common').innerHTML }));
    dp1.doLayout();
}

var ssif1 = null;
var css2 = -1;
var ssd12 = null;
var leftName = null;
var rightName = null;
function ossc1() {
    ssif1 = this;
    leftName = ssif1.common.dir1;
    rightName = ssif1.common.dir2;
    css2 = -1;
    ssd12 = [];
    adltdy(3);
    adltdy(9);
    adltdy(8);
    adltdy(5);
    adltdy(4);
    adltdy(6);
    adltdy(7);
    onServiceNext('left');
}

function adltdy(layerId) {
    var lastLayerId = null;
    for(var i = 0; i < ssif1.services.length; i++) {
        if (lastLayerId != ssif1.services[i].layer && ssif1.services[i].layer == layerId) {
            var displayObj = { };
            switch(ssif1.services[i].layer) {
                case 3: displayObj.img = 'Images/Markers/poi_azs.png'; break;
                case 4: displayObj.img = 'Images/Markers/poi_bus.png'; break;
                case 5: displayObj.img = 'Images/Markers/poi_food.png'; break;
                case 6: displayObj.img = 'Images/Markers/poi_otdyh.png'; break;
                case 7: displayObj.img = 'Images/Markers/poi_shop.png'; break;
                case 8: displayObj.img = 'Images/Markers/poi_sto.png'; break;
                case 9: displayObj.img = 'Images/Markers/poi_wash.png'; break;
            }
            displayObj.name = ssif1.services[i].layerName;
            displayObj.left = [];
            displayObj.right = [];

            if (ssif1.services[i].dir == 'слева')
                addPOIToDir(displayObj.left, ssif1.services[i], ssif1.common.km1);
            else    
                addPOIToDir(displayObj.right, ssif1.services[i], ssif1.common.km2);
            ssd12.push(displayObj);
            lastLayerId = ssif1.services[i].layer;
        } else  if (ssif1.services[i].layer == layerId) {
            if (ssif1.services[i].dir == 'слева')
                addPOIToDir(displayObj.left, ssif1.services[i], ssif1.common.km1);
            else    
                addPOIToDir(displayObj.right, ssif1.services[i], ssif1.common.km2);
        }
    }
}

function addPOIToDir(dir, poi, km) {
    if (dir.length < 3)
        dir.push(poi);
    else {
        var maxIndex = 0;
        var max = 0;
        for (var i = 0; i < dir.length; i++) {
            if (Math.abs(dir[i].km - km) > max) {
                max = Math.abs(dir[i].km - km);
                maxIndex = i;
            }
        }
        if (max > Math.abs(poi.km - km)) 
            dir[maxIndex] = poi;
    }
}

function onServiceNext(dir) {
    if (dir == 'right')
        css2 = css2 > 0 ? (css2 - 1) : 0;
    else
        css2 = css2 < (ssd12.length - 1) ? (css2 + 1) : (ssd12.length - 1);

    if (css2 == 0)
        Ext.getDom('services_left').src = eu1;
    else
        Ext.getDom('services_left').src = ssd12[css2 - 1].img;
    if (css2 == ssd12.length - 1)
        Ext.getDom('services_right').src = eu1;
    else
        Ext.getDom('services_right').src = ssd12[css2 + 1].img;
    Ext.getDom('services_center').src = ssd12[css2].img;
    Ext.getDom('services_layer_name').innerHTML = ssd12[css2].name;

    var str = '';
    str += buildServicesList(ssd12[css2].left, leftName);
    str += buildServicesList(ssd12[css2].right, rightName);
    Ext.getDom('services_list').innerHTML = str;

    dp1.removeAll();
    dp1.add(new Ext.Panel({ html: Ext.getDom('services').innerHTML }));
    dp1.doLayout();
}

function buildServicesList(list, name) {
    var str = '';
    if (list.length > 0) {
        str += '<span class="arial11 bold">' + name + '</span><br />';
        for (var i = 0; i < list.length; i++) {
            str += '<span class="arial10 bold">' + list[i].km.toFixed(1) + ' км:</span>';
            str += '  <span class="arial10">' + gdfl(list[i].name) + '</span><br />';
        }
    }
    return str;
}

function orrc1() {
    dp1.removeAll();
    Ext.getDom('repair_content').innerHTML = '';
    dp1.add(new Ext.Panel({ html: Ext.getDom('repair').innerHTML }));
    dp1.doLayout();
    Ext.util.JSONP.request({
        url: 'Data.ashx',
        callbackKey: 'callback',
        params: { source: 'repair', id: this.roadId },
        callback: Ext.util.Functions.createDelegate(ogrrd2, { })
    });
}

function ogrrd2(result) {
    var str = "";
    for (var i = 0; i < result.length; i++) {
        if (result[i].Descr != null && result[i].Descr != '')
            str += '<span class="arial10 bold">' + result[i].Descr + '</span><br/>';
        var endStr = gdfl(result[i].End, '');
        str += '<span class="arial10 bold">' + 
            + result[i].Start + (endStr == '' ? '' : (' - ' + result[i].End)) + ' км:</span>  <span class="arial10">' + result[i].StartDateStr + ' - ' + result[i].EndDateStr + '</span><br/>';
        str += '<span class="arial10">Исполнитель: ' + gdfl(result[i].Executor) + '</span><br/>';
    }
    if (str == "")
        str = "нет ремонта";
    Ext.getDom('repair_content').innerHTML = str;
    dp1.removeAll();
    dp1.add(new Ext.Panel({ html: Ext.getDom('repair').innerHTML }));
    dp1.doLayout();
}

var search = null;
function getSearch() {
    if (search != null)
        return search;

    search = new Ext.Panel({
        floating: true,
        modal: true,
        width: 260,
        height: 90,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'ПОИСК',
                        height: 40,
                        style: { fontSize: '10pt', fontWeight: 'bold' },
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        items: [ { xtype: 'panel', contentEl: 'search' } ]
    });

    return search;
}

var sp1 = null;
function getTopSettings() {
    if (sp1 != null)
        return sp1;

    Ext.regModel('topSettings', {
        fields: ['name']
    });

    var store = new Ext.data.JsonStore({
        model  : 'topSettings',
        data: [
            {name: 'Картооснова'},
            {name: 'Объекты на карте'},
            {name: 'О программе'}
        ]
    });

    var list = new Ext.List({ 
        itemTpl : '{name} <img style="float:right" src="Images/next.png" />',
        selectedItemCls: '',
        grouped : false,
        indexBar: false,   
        store: store,
        listeners:{ 
            itemtap: function(cmp,index,element,e) {
                getTopSettings().hide();
                switch(index){
                    case 0:
                        getMapSettings().showBy(sb1);
                        break;
                    case 1:
                        getObjectsSettings().showBy(sb1);
                        break;
                    case 2:
                        getAbout().show();
                        break;
                }
            }
        }
    });

    sp1 = new Ext.Panel({
        floating: true,
        modal: true,
        width: 220,
        height: 200,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'НАСТРОЙКИ',
                        height: 40,
                        style: { fontSize: '10pt', fontWeight: 'bold' },
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        items: [ list ]
    });

    return sp1;
}

var aboutPanel = null;
function getAbout() {
    if (aboutPanel != null)
        return aboutPanel;

    aboutPanel = new Ext.Panel({
        floating: true,
        modal: true,
        centered: true,
        width: 220,
        height: 180,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'О ПРОГРАММЕ',
                        titleCls: 'x-toolbar-title aboutTitle',
                        height: 40,
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        html: Ext.getDom('about').innerHTML
    });

    return aboutPanel;

}

var noInfoPanel = null;
function getNoInfo() {
    if (noInfoPanel != null)
        return noInfoPanel;

    noInfoPanel = new Ext.Panel({
        floating: true,
        modal: true,
        centered: true,
        width: 220,
        height: 80,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        height: 40,
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        html: Ext.getDom('no_info').innerHTML
    });

    return noInfoPanel;

}

var mapPanel = null;
var mapList = null;
function getMapSettings(){
    if (mapPanel != null)
        return mapPanel;

    Ext.regModel('mapSettings', {
        fields: ['name', 'image']
    });

    var store = new Ext.data.JsonStore({
        model  : 'mapSettings',
        data: [
            { name: 'Карта', image: 'map.png' },
            { name: 'Спутник', image: 'stallite.png' },
            { name: 'Гибрид', image: 'hybrid.png' }
        ]
    });

    mapList = new Ext.List({ 
        itemTpl : '<div img="img"></div> {name} <img style="float:right" src="Images/{image}" />',
        itemCls: 'deSelectedItem',
        disableSelection: true,
        grouped : false,
        indexBar: false,   
        store: store,
        listeners:{ 
            itemtap: function(cmp, index, element, e) {
                var nodes = cmp.getNodes(0, 3);
                for (var i in nodes) {
                    try {
                        Ext.get(nodes[i]).removeCls('selectedItem');
                    } catch (err) {}
                }
                Ext.get(element).addCls('selectedItem');
                switch(index){
                    case 0:
                        m1.map.setMapTypeId("ArcGIS");
                        break;
                    case 1:
                        m1.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                        break;
                    case 2:
                        m1.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                        break;
                }
            }
        }
    });

    window.setTimeout(function () {
        try {
            Ext.get(mapList.getNode(0)).addCls('selectedItem');
        } catch (err) {}
    }, 0);

    mapPanel = new Ext.Panel({
        floating: true,
        modal: true,
        width: 220,
        height: 220,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'ОСНОВА',
                        height: 40,
                        style: { fontSize: '10pt', fontWeight: 'bold' },
                        items: [
                            { 
                                ui: 'back', 
                                text: 'Назад',
                                handler: function(){
                                    getMapSettings().hide();
                                    getTopSettings().showBy(sb1);
                                }
                            },
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        items: [ mapList ]
    });

    return mapPanel;
}

var objectsPanel = null;
var objectsStore = null;
function getObjectsSettings(){
    if (objectsPanel != null)
        return objectsPanel;

    Ext.regModel('objSettings', {
        fields: ['name', 'id', 'state']
    });

    var objectsStore = new Ext.data.JsonStore({
        model  : 'objSettings',
        data: [
            { name: 'Видеокамеры', id: 'video', img: 'video', state: false, zindex: 1 },
            { name: 'Метеостанции', id: 'meteo', img: 'meteo', state: false, zindex: 1 },
            { name: 'Скорость', id: 'sensors', img: 'sensors', state: false, zindex: 1 },
            { name: 'Ремонт', id: 'remont', img: 'remont', state: false, zindex: 0 },
            { name: 'АЗС', id: 'poi_azs', img: 'poi_azs', state: false, zindex: 1 },
            { name: 'Автомойки', id: 'poi_wash', img: 'poi_wash', state: false, zindex: 1 },
            { name: 'СТО', id: 'poi_sto', img: 'poi_sto', state: false, zindex: 1 },
            { name: 'Пункты питания', id: 'poi_food', img: 'poi_food', state: false, zindex: 1 },
            { name: 'Остановки', id: 'poi_bus_a', img: 'poi_bus', state: false, zindex: 1 },
            { name: 'Места отдыха', id: 'poi_otdyh', img: 'poi_otdyh', state: false, zindex: 1 },
            { name: 'Магазины', id: 'poi_shop', img: 'poi_shop', state: false, zindex: 1 }
        ]
    });

    var list = new Ext.List({
        itemTpl: '<div img="img"></div> {name} <img style="float:right" class="markerInList" src="Images/Markers/{img}.png" />',
        itemCls: 'deSelectedItem',
        disableSelection: true,
        grouped: false,
        scroll: 'vertical',
        height: (Ext.is.Phone ? 240 : 440),
        store: objectsStore,
        listeners: {
            itemtap: function (cmp, index, element, e) {
                cmp.getStore().getAt(index).data.state = !cmp.getStore().getAt(index).data.state;
                if (cmp.getStore().getAt(index).data.state)
                    Ext.get(element).addCls('selectedItem');
                else
                    Ext.get(element).removeCls('selectedItem');

                switch(cmp.getStore().getAt(index).data.id) {
                    default:
                        shm(cmp.getStore().getAt(index).data.id);
                        break;
                    case 'remont':
                    case 'poi_bus_a':
                        if (cmp.getStore().getAt(index).data.state)
                            showLayer(cmp.getStore().getAt(index).data.id);
                        else
                            hideLayer(cmp.getStore().getAt(index).data.id);
                        break;
                }
            }
        }
    });

    objectsPanel = new Ext.Panel({
        floating: true,
        modal: true,
        width: 220,
        height: (Ext.is.Phone ? 300 : 500),
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'ОБЪЕКТЫ',
                        height: 40,
                        style: { fontSize: '10pt', fontWeight: 'bold' },
                        items: [
                            { 
                                ui: 'back', 
                                text: 'Назад',
                                handler: function(){
                                    getObjectsSettings().hide();
                                    getTopSettings().showBy(sb1);
                                }
                            },
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        items: [ list ]
    });

    return objectsPanel;
}

function showLayer(id) {
    ls[id].setMap(m1.map);
}

function hideLayer(id) {
    ls[id].setMap(null);
}

function onSearch() {
    if (Ext.getDom('search_text').value.length > 0){
        showProgress();
        Ext.util.JSONP.request({
            url: 'http://maps.google.com/maps/geo',
            callbackKey: 'callback',
            params: {
                q: Ext.getDom('search_text').value,
                sensor: true,
                output: 'json',
                oe: 'utf8',
                gl: 'ru',
                ll: '55.607,37.68',
                spn: '1.363,2.538',
                key: gkey
            },
            callback: onGetSearch
        });
    }
}

function onGetSearch(result) {
    hideProgress();
    if (result != null && result.Placemark != null && result.Placemark.length > 0) {
        if (sm1 != null)
            sm1.setMap(null);
        var coord = new google.maps.LatLng(result.Placemark[0].Point.coordinates[1], result.Placemark[0].Point.coordinates[0]);
        sm1 = new google.maps.Marker({
            zIndex: 1000,
            position: coord,
            map: m1.map
        });
        m1.map.panTo(coord);
        m1.map.setZoom(10);      
    }
}

function showProgress() {
    Ext.getDom('request_progress').style.top = (document.documentElement.clientHeight - 20) + 'px';
    Ext.getDom('request_progress').style.left = (document.documentElement.clientWidth - 200) + 'px';

    Ext.getDom('request_progress').style.display = 'block';
}

function hideProgress() {
    Ext.getDom('request_progress').style.display = 'none';
}

function onSearchKeyDown(e) {
    if (e.keyCode == 13)
        onSearch();
}