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

$(function(){
	
	$('.boxT').on('click',function(e){
		console.log('helo',e)
		spot=getBoxPosition($('.boxPlayer'))
		tpot=getBoxPosition(e.currentTarget);
		console.log('Player Move',spot,'->',tpot)
		movePlayer(tpot[0],tpot[1])

	})
})

// 获取指定盒子的位置
/*
定位规则

0,0---1,0----2,0----3,0----> x
 \
 0,1
   \
   0,2
     \
	 0,3
	   \
	   ↓   y


*/
function getBoxPosition(box){
	console.log($(box).parent().parent().index(),$(box).parent().parent().parent().index());
	pot=[$(box).parent().parent().index(),$(box).parent().parent().parent().index()]
	return pot;
}

function movePlayer(x,y){
	$('.boxPlayer').removeClass('boxPlayer');
	$($($('.box').children()[y]).find('.boxT')[x]).addClass('boxPlayer');

}

