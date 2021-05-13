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



var Direct = {
    rightTop : 0,
    right : 1,
    rightBottom : 2,
    leftBottom : 3,
    left : 4,
    leftTop : 5
};


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
	
	setEnemy(-2,4);
	setMountain(0,-1);

	setUserObstacle([0,0],[1,0]);
	setUserObstacle([0,0],[1,1]);
	setUserObstacle([0,0],[0,1]);
	setUserObstacle([0,0],[-1,0]);
	setUserObstacle([0,0],[-1,-1]);
	setUserObstacle([0,0],[0,-1]);
	// setEnemy(0,2);
	// setEnemy(0,-1);
	// setEnemy(0,-2);



}

// 制作一行的单元格元素并返回
function makeLine(len,y,xOffset){
	lineTemplate='<div class="line"></div>';
	cellTemplate='<div class="boxF"><div class="boxS"><div data-boardPot="#boardPot#" class="boxT"><div class="overlay"><a>#text#</a></div><div class="boxTBorder"><div class="boxSBorder"><div class="boxFBorder"></div></div></div></div></div></div>';
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

		if(!isCellNearby(spot,tpot)){
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

// 检测两个格子是否相邻
function isCellNearby(spot,tpot){
	let dx=tpot[0]-spot[0];
	let dy=tpot[1]-spot[1];
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

//设定目标
function setGoal(x,y){
	getCell(x,y).addClass('boxGoal');
}

//设置自然障碍
function setMountain(x,y){
	getCell(x,y).addClass('boxMountain');
}



//设置用户手动设置的障碍
//传入两个格的位置,自动将之间的边设为障碍
function setUserObstacle(pot1,pot2){
	
	if(!isCellNearby(pot1,pot2)){
		console.log("Error","两个格子不相邻","setUserObstacle",pot1,pot2);
		return;
	}
	let dx=pot2[0]-pot1[0];
	let dy=pot2[1]-pot1[1];
	switch(dy){
		case 1:
			switch(dx){
				case 1:
					boxObstacle(pot1,Direct.rightTop,true);
					boxObstacle(pot2,Direct.leftBottom,true);
					break;
				case 0:
					boxObstacle(pot1,Direct.leftTop,true);
					boxObstacle(pot2,Direct.rightBottom,true);
					break;
			}
			break;
		case 0:
			switch(dx){
				case 1:
					boxObstacle(pot1,Direct.right,true);
					boxObstacle(pot2,Direct.left,true);
					break;
				case -1:
					boxObstacle(pot1,Direct.left,true);
					boxObstacle(pot2,Direct.right,true);
					break;
			}
			break;
		case -1:
			switch(dx){
				case 0:
					boxObstacle(pot1,Direct.rightBottom,true);
					boxObstacle(pot2,Direct.leftTop,true);
					break;
				case -1:
					boxObstacle(pot1,Direct.leftBottom,true);
					boxObstacle(pot2,Direct.rightTop,true);
					break;
			}
			break;

	}

}

//绘制指定位置的障碍 
//direct传入 Direct
function boxObstacle(pot,direct,enable){
	let cell=getCell(pot[0],pot[1]);
	if(enable){
		switch(direct){
			case Direct.rightTop:cell.addClass("RTBorder");break;
			case Direct.right:cell.addClass("RBorder");break;
			case Direct.rightBottom:cell.addClass("RBBorder");break;
			case Direct.leftBottom:cell.addClass("LBBorder");break;
			case Direct.left:cell.addClass("LBorder");break;
			case Direct.leftTop:cell.addClass("LTBorder");break;
		}
	}else{
		switch(direct){
			case Direct.rightTop:cell.removeClass("RTBorder");break;
			case Direct.right:cell.removeClass("RBorder");break;
			case Direct.rightBottom:cell.removeClass("RBBorder");break;
			case Direct.leftBottom:cell.removeClass("LBBorder");break;
			case Direct.left:cell.removeClass("LBorder");break;
			case Direct.leftTop:cell.removeClass("LTBorder");break;
		}
	}
}


//计算敌人的移动
function calcEnemiesMove(){
	enemies=$('.boxEnemy');
	tpot=getPotFromCell($('.boxPlayer'));
	// console.log(enemies);
	$(".boxEnemyRoute").removeClass("boxEnemyRoute");
	for(let i=0;i<enemies.length;i++){
		enemy=$(enemies[i]);
		spot=getPotFromCell(enemy);
		let nextPot=findNearestWay(spot,tpot);
		displayEnemyRoute(nextPot,tpot);
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

//显示敌人前进路线
function displayEnemyRoute(spot,tpot){
	let count = 1;
	let nextPot=displayEnemyRoute_next(spot,tpot,count);
	
	while(nextPot[0]!=tpot[0] || nextPot[1]!=tpot[1]){
		nextPot=displayEnemyRoute_next(nextPot,tpot,count);
		count=count+1;
		console.log(nextPot,count)
	}

}


function displayEnemyRoute_next(spot,tpot,count){
	nextPot=findNearestWay(spot,tpot);
	let a = getCell(spot[0],spot[1]);
	
	if(!a.hasClass("boxEnemy")){
		a.find("a").text("R"+count);
		a.addClass("boxEnemyRoute");
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

// 右键菜单设置雪山callback
function callback_setMountainButton(){
	console.log('手动设置雪山',menuSelectedPot)
	setMountain(menuSelectedPot[0],menuSelectedPot[1]);
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
