function onDocKeydown(e)
{
    e = e||window.event;
    if( e.ctrlKey && e.keyCode==83 )
   {
		console.log(e.keyCode)
		$(document.body).css("background","pink");
		setTimeout(function(){
			$(document.body).css("background","#ddd")
		},200)
    return false;
   }
}
document.onkeydown = onDocKeydown;