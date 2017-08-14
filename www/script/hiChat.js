//建立到服务器的socket连接
var socket = io.connect();
//监听connect事件，并触发回调函数
socket.on('connect',function(){
	//alert($('#info').text());  连上服务器
	$('#info').html('get yourself a nickName')
	$('#nickName').css('display','block');
})

initalEmoji = function(){
	
}

displayNewMsg = function(user,msg,color){
	var date = new Date().toTimeString().substr(0,8),//获取时间
		msgToPlay = document.createElement('p');
		msg = showEmoji(msg);
	msgToPlay.innerHTML =user+': '+msg+'<span id="timeSpan">'+date+'</span><br>';
	msgToPlay.style.color = color||'#000';
	$('#show').append(msgToPlay);
	//$('#show').scrollTop($('#show').scrollHeight);//滚动条
	var container = $('#show')[0];
	//alert(container.scrollHeight)
	container.scrollTop = container.scrollHeight;
}
displayNewImg = function(user,imgData,color){
	var date = new Date().toTimeString().substr(0,8),//获取时间
		msgToPlay = document.createElement('p');
	//msgToPlay.innerHTML =user+': '+'<span id="timeSpan">'+date+'</span>'+'</br><a href="'+imgData+'"><img src"'+imgData+'"/></a>';
	msgToPlay.innerHTML =user+': '+'<span id="timeSpan">'+date+'</span>'+'</br><a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
	$('#show').append(msgToPlay);
	// $('#show p').css('color',color);
	//$('#show').scrollTop($('#show').scrollHeight);//滚动条
	var container = $('#show');
	container.scrollTop = container.scrollHeight;
}
showEmoji = function(msg){
	var match,result = msg,reg = /\[emoji:\d+\]/g,emojiIndex,
		totalEmojiNum = document.getElementById('emojiWrapper').children.length;
	while(match = reg.exec(msg)){
		emojiIndex = match[0].slice(7,-1);
		if(emojiIndex>totalEmojiNum){
			result = result.replace(match[0],'[X]');
		}
		else{
			//alert(emojiIndex)
			result = result.replace(match[0],'<img class="emoji" src="../content/emoji/'+emojiIndex+'.gif">')
		}
	}
	return result;
}

//名字已存在是触发
socket.on('nickExisted',function(){
	alert('名字已存在')
})
//成功登陆是触发
socket.on('longinSuccess',function(){
	$('#loginWrapper').css('display','none');
	$('#messageInput').focus();
})

//system提示
socket.on('system',function(nickName,usersCount,type){
	//判断用户是离开，还是进来以显示不同信息
	var msg = nickName+(type=='login'? '进入':'离开');//如果type==login，则显示进入，否则显示离开
	//$('#show').append('<p>'+msg+'</p>');//添加元素，显示用户离开还是进入
	displayNewMsg('system',msg,'red')
	$('#usersCount').html(usersCount+' 个人在线');

})

//点击登录按钮
$('#loginBtn').click(function(){
	var nickName = $('#nickNameInput').val();
	if(nickName.trim().length!=0){
		//发送一个login事件到服务器，并将输入的名字传到服务器
		socket.emit('login',nickName);
		log = false;
	}
	else{
		//如果输入内容为空，则重新获得焦点
		$('nickNameInput').focus();
		alert('不能为空')
	}
})
//回车登录
var log = true;
$('body').on('keydown',function(e){
	if(e.keyCode==13&&log){
		$('#loginBtn').click();	
	}
	if(e.keyCode==13){
		$('#sendBtn').click();
	}
})

//发送按钮
$('#sendBtn').click(function(){
	var msg = $('#messageInput').val();
	var color = $('#colorStyle').val();
	//alert(color);
	if(msg.trim().length!=0){
		socket.emit('postMsg',msg,color);//发送msg到服务器的postMsg事件
		displayNewMsg('我',msg,color);
		$('#messageInput').val('');
		$('#messageInput').focus();
	}
	
})
//接受新信息
socket.on('newMsg',function(user,msg,color){
	displayNewMsg(user,msg,color);
})
//接受新图片
socket.on('newImg',function(user,img){
	displayNewImg(user,img);
})

//触发选择图片的事件
$('#sendImg').change(function(){
	//alert('1');
	//
	if(this.files.length!=0){
		var file = this.files[0],
			reader = new FileReader();
		//如果浏览器不支持;
		if(!reader){
			displayNewMsg('system','!!your browser doesn\'t support fileReader','red');
			this.value='';
			return
		}
		//成功读取完成触发
		reader.onload = function(e){
			this.value='';
			socket.emit('img',e.target.result);
			displayNewImg('me',e.target.result);
			//alert(e.target.result); e.target.result  事件对象
		}
		reader.readAsDataURL(file);//将文本读取为Dataurl
	}
})

//选择emoji表情按钮
var isFirst = true;
$('#emojiBtn').click(function(e){
		$('#emojiWrapper').css('display','block');
		var emojiWrapper = $('#emojiWrapper')[0];
		e.stopPropagation();//该方法将停止事件的传播，阻止它被分派到其他 Document 节点
		docFragment = document.createDocumentFragment();
		if(isFirst){ //只加载一次表情
			for(var i=69;i>0;i--){
			var emojiItem = document.createElement('img');
			emojiItem.src = '../content/emoji/'+i+'.gif';
			emojiItem.title = i;
			docFragment.appendChild(emojiItem);
			}
			//alert()
			emojiWrapper.appendChild(docFragment);
			isFirst = false;
		}
		
})
//获取被点击的表情
$('#emojiWrapper').click(function(e){
	var target = e.target;
	if(target.nodeName.toLowerCase()=='img'){
		$('#messageInput').focus();
		var messageInput = $('#messageInput')[0];
		messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
	}
})

//点击除emoji按钮其他地方，隐藏表情列表
$('body').click(function(e){
	if(e.target!=$('#emojiWrapper')[0]){
		$('#emojiWrapper').css('display','none');
	}
})

//clear 按钮清空聊天窗内容
$('#clearBtn').click(function(){
	$('#show').empty();
})