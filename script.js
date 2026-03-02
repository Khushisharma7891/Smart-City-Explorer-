var map = L.map('map').setView([28.6139,77.2090], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

var markers=[];

var placeIcon = L.icon({
iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
iconSize: [28,28]
});

var metroIcon = L.icon({
iconUrl: "https://cdn-icons-png.flaticon.com/512/484/484167.png",
iconSize: [28,28]
});

function showLoader(){
var loader=document.getElementById("loader");
if(loader){ loader.style.display="block"; }
}

function hideLoader(){
var loader=document.getElementById("loader");
if(loader){ loader.style.display="none"; }
}

var globalShortNames = {
"cp":"Connaught Place",
"hk":"Hauz Khas",
"ndls":"New Delhi Railway Station",
"nyc":"New York City",
"la":"Los Angeles",
"sf":"San Francisco",
"uk":"United Kingdom",
"uae":"United Arab Emirates"
};

function smartGlobalName(name){

if(!name) return "";

name = name.toLowerCase().trim();

if(globalShortNames[name]){
return globalShortNames[name];
}

return name;
}

function clearMarkers(){

for(var i=0;i<markers.length;i++){
map.removeLayer(markers[i]);
}

markers=[];

}

function searchLocation(){

var location=document.getElementById("searchBox").value;

if(!location){
alert("Please enter location");
return;
}

showLoader();

fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${smartGlobalName(location)}`)
.then(res=>res.json())
.then(data=>{

hideLoader();

if(data.length==0){
alert("Location not found");
return;
}

var lat=data[0].lat;
var lon=data[0].lon;

map.setView([lat,lon],14);

var marker=L.marker([lat,lon],{icon:placeIcon}).addTo(map);

markers.push(marker);

})
.catch(()=>{
hideLoader();
alert("Error fetching location");
});

}

function getLocation(){

navigator.geolocation.getCurrentPosition(function(pos){

var lat=pos.coords.latitude;
var lon=pos.coords.longitude;

map.setView([lat,lon],14);

var marker=L.marker([lat,lon],{icon:placeIcon})
.addTo(map)
.bindPopup("My Location");

markers.push(marker);

}, function(){
alert("Location permission denied");
});

}

function showPlaces(type){

clearMarkers();

var location=document.getElementById("startBox").value;

if(location==""){
alert("Search location first");
return;
}

showLoader();

var query=`https://nominatim.openstreetmap.org/search?format=json&q=${type} in ${smartGlobalName(location)}&limit=50`;

fetch(query)
.then(res=>res.json())
.then(data=>{

hideLoader();

if(data.length==0){
alert("No results found");
return;
}

for(var i=0;i<data.length;i++){

var lat=data[i].lat;
var lon=data[i].lon;
var name=data[i].display_name;

var iconType = (type === "metro station") ? metroIcon : placeIcon;

var m=L.marker([lat,lon],{icon:iconType})
.addTo(map)
.bindPopup(name);

markers.push(m);
}

map.setView([data[0].lat,data[0].lon],13);

})
.catch(()=>{
hideLoader();
alert("Error fetching places");
});

}

function showMetro(){
showPlaces("metro station");
}

function findRoute(){

clearMarkers();

var start=document.getElementById("startBox").value;
var dest=document.getElementById("destBox").value;

if(!start || !dest){
alert("Enter both start and destination");
return;
}

showLoader();

fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${smartGlobalName(start)}`)
.then(res=>res.json())
.then(data=>{

if(data.length==0){
hideLoader();
alert("Start location not found");
return;
}

var lat1=data[0].lat;
var lon1=data[0].lon;

var m1=L.marker([lat1,lon1],{icon:placeIcon})
.addTo(map)
.bindPopup("Start");

markers.push(m1);

fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${smartGlobalName(dest)}`)
.then(res=>res.json())
.then(data2=>{

hideLoader();

if(data2.length==0){
alert("Destination not found");
return;
}

var lat2=data2[0].lat;
var lon2=data2[0].lon;

var m2=L.marker([lat2,lon2],{icon:placeIcon})
.addTo(map)
.bindPopup("Destination");

markers.push(m2);

var line=L.polyline([
[lat1,lon1],
[lat2,lon2]
],{color:"#1f2933"}).addTo(map);

markers.push(line);

map.fitBounds([
[lat1,lon1],
[lat2,lon2]
]);

var distance=map.distance(
[lat1,lon1],
[lat2,lon2]
)/1000;

document.getElementById("distanceText").innerHTML=
"Distance : "+distance.toFixed(2)+" KM";

})
.catch(()=>{
hideLoader();
alert("Error fetching destination");
});

})
.catch(()=>{
hideLoader();
alert("Error fetching start location");
});

}