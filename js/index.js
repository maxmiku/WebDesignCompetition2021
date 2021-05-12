// 忽略保存按钮(开发时使用)
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

let menuSelectedPot=null;

// 获取指定盒子的位置
/*
定位规则

↑  y
 \
 0,3
   \
   0,2
     \
	 0,1
	   \
	   0,0---1,0----2,0----3,0----> x
	   


*/
// function getBoxPosition(box){
// 	// console.log($(box).parent().parent().index(),$(box).parent().parent().parent().index());
// 	pot=[$(box).parent().parent().index(),$(box).parent().parent().parent().index()]
// 	return pot;
// }

// 玩家移动
function movePlayer(x,y){
	$('.boxPlayer').removeClass('boxPlayer');
	getCell(x,y).addClass('boxPlayer');
	// $($($('.board').children()[y]).find('.boxT')[x]).addClass('boxPlayer');

}


// 棋盘自动生成
function initBoard(){
	let yLen=9;
	let xLen=9;

	let yOddOffset=0;//计算x偏移时的y奇数行补偿

	$('#mainBoard').empty();

	let yOffset=Math.floor(yLen/2);
	if((yLen-yOffset-1)%2==0){
		//中心点所在行为奇数行
		yOddOffset=1;//需要补偿
	}
	console.log((yLen-yOffset-1))
	for(let i=0;i<yLen;i++){
		y=yLen-(i+yOffset)-1;
		xOffset=-Math.floor(xLen/2)+(Math.floor((y+yOddOffset)/2));
		console.log(y,xOffset,Math.floor((y+yOddOffset)/2))
		$('#mainBoard').append(makeLine(xLen,y,xOffset))
	}

	bondageBoxEvent();
	movePlayer(0,0);
	
	// setEnemy(0,1);
	// setEnemy(0,2);
	// setEnemy(0,-1);
	// setEnemy(0,-2);



}

// 制作一行的单元格元素并返回
function makeLine(len,y,xOffset){
	lineTemplate='<div class="line"></div>';
	cellTemplate='<div class="boxF"><div class="boxS"><div data-boardPot="#boardPot#" class="boxT"><div class="overlay"><a>#text#</a></div></div></div></div>';
	let line = $(lineTemplate);

	
	for(let i=0;i<len;i++){
		line.append($(cellTemplate.replace("#text#",(i+xOffset)+','+y).replace("#boardPot#",(i+xOffset)+','+y)));
	}
	return line;

}

// 绑定单元格点击事件 (初始化)
function bondageBoxEvent() {
	$('.boxT').on('click',function(e){
		// console.log('helo',e)
		spot=getPotFromCell($('.boxPlayer'));
		tpot=getPotFromCell(e.currentTarget);
		console.log('Player Move',spot,'->',tpot)

		if(!checkPlayerMove(spot,tpot)){
			console.log("越权操作,每次只能移动一步")
			return;
		}

		


		movePlayer(tpot[0],tpot[1]);
		if($(e.currentTarget).hasClass('boxGoal')){
			$(e.currentTarget).removeClass('boxGoal');
			setTimeout(function(){
				alert("你赢了");
			},400);
			
			return;
		}


		calcEnemiesMove();

	});

	$('.boxT').on('contextmenu',function(e){
		
		
		var key=e.which;//获取鼠标键位
		if(key==3){//1：代表左键；2：代表中键；3：代表右键
			//获取右键点击坐标
			menuSelectedPot=getPotFromCell(e.currentTarget);
			var x=e.clientX;
			var y=e.clientY;
			$('.menu').show().css({left:x,top:y});
			return false;
		}
		
	})
	//点击任意部位隐藏
	$(document).on('click',function(){
		$('.menu').hide();
		// menuSelectedPot=null;
	})
}

// 检测玩家移动是否合法
function checkPlayerMove(spot,tpot){
	dx=tpot[0]-spot[0];
	dy=tpot[1]-spot[1];
	if(dx*dy==0){
		if(Math.abs(dx)==1){
			return true;
		}else if(Math.abs(dy)==1){
			return true;
		}
	}else{
		if(Math.abs(dx+dy)==2 && Math.abs(dx)==1){
			return true;
		}
	}
	return false;
}

// 通过坐标获取单元格
function getCell(x,y){
	return $(".boxT[data-boardpot='"+x+","+y+"']");
}

// 通过单元格获取坐标
function getPotFromCell(cell){
	pot=$(cell).attr('data-boardpot').split(',');
	if(pot.length==2){
		return [Number(pot[0]),Number(pot[1])];
	}else{
		return $(cell).attr('data-boardpot');
	}
}


//设置敌人
function setEnemy(x,y){
	getCell(x,y).addClass('boxEnemy');
}

function setGoal(x,y){
	getCell(x,y).addClass('boxGoal');
}


//计算敌人的移动
function calcEnemiesMove(){
	enemies=$('.boxEnemy');
	tpot=getPotFromCell($('.boxPlayer'));
	// console.log(enemies);
	for(let i=0;i<enemies.length;i++){
		enemy=$(enemies[i]);
		spot=getPotFromCell(enemy);
		nextPot=findNearestWay(spot,tpot);
		console.log(spot,'->',nextPot);
		enemy.removeClass('boxEnemy');
		setEnemy(nextPot[0],nextPot[1]);
		if(nextPot[0]==tpot[0] && nextPot[1]==tpot[1]){
			alert("游戏结束,你被敌人追上了")
		}
	}
}

// 寻找最短的路,返回最短的路的下一个坐标点
function findNearestWay(spot,tpot){
	dy=tpot[1]-spot[1];
	nextPot=[spot[0],spot[1]];
	if(spot[1]>tpot[1]){
		//向下
		if(spot[0]>=tpot[0]-dy/2){
			//左下
			nextPot[1]--;
			nextPot[0]--;
		}else{
			//右下
			nextPot[1]--;
		}
	}else if(spot[1]==tpot[1]){
		//左右
		if(spot[0]>=tpot[0]){
			//左
			nextPot[0]--;
		}else{
			//右
			nextPot[0]++;
		}
	}else if(spot[1]<tpot[1]){
		//向上
		if(spot[0]<tpot[0]-dy/2){
			//右上
			nextPot[0]++;
			nextPot[1]++;
		}else{
			//左上
			nextPot[1]++;
		}

	}
	return nextPot;
}





// 右键菜单设置敌人callback
function callback_setEnemyButton(){
	console.log('手动设置敌人',menuSelectedPot)
	setEnemy(menuSelectedPot[0],menuSelectedPot[1]);
}

// 右键菜单设置终点callback
function callback_setGoalButton(){
	console.log('手动设置终点',menuSelectedPot)
	setGoal(menuSelectedPot[0],menuSelectedPot[1]);
}

// 右键菜单重置棋盘callback
function callback_initBoardButton(){
	initBoard();
}


$(function(){
	initBoard()
})


// document.oncontextmenu=function(){
// 	return false;
// }
