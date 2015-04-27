document.addEventListener("click",function(event){
	var target = event.target;
	console.log("click");
	tt = target;
	var action = target.getAttribute("data-action");
	var matchStart = false;
	if(action){
		var splited_action = action.split("-");
		var action = splited_action[0];
		var aim = splited_action[1];

		if("new" === action){
			var object = initObject(aim);
			editQuestion(object,true,0);	
		}else if("add" === action){
			if("question" === aim){
				addQuestion();
			}else if("option" === aim){
				addOption();
			}
		}else if("edit" === action){
			var index = Number(aim);
			var question = Page.questions[index];
			editQuestion(question,false,index);
		}else if("update" === action){
			var index = Number(aim);
			Page.questions[index] = buildQuestion();
			compileAndSet("play_ground",Page,"#play_ground");
		}else if("match_src" === action) {
			matchStart = true;
			if(!target.checked){
				Match.end(aim);
			}else{
				Match.start(aim,target);
			}
			
		}else if("match_dest" === action) {
			Match.finish(aim);
		}
	}
});

document.addEventListener("input",function(event) {
	var target = event.target;
	var action = target.getAttribute("data-action");
	if(action){
		var splited_action = action.split("-");
		var action = splited_action[0];
		if("sync" === action){
			var aim = splited_action[1];

			var tree = aim.split(".");
			var dest = window[tree.shift()];
			if(tree.length>1){
				dest = dest[tree.shift()];
			}
			dest[tree.shift()] = target.value;
			compileAndSet("play_ground",Page,"#play_ground");			
		}
	}
});

document.addEventListener("mouseover",function(event){

	tip(event,true);
});
document.addEventListener("mouseout",function(event){
	tip(event,false);
});


function tip(event,movein){
	var target = event.target;
	var action = target.getAttribute("data-action");
	if(action){
		var splited_action = action.split("-");
		var action = splited_action[0];
		var aim = splited_action[1];
		if(action === "match_src"){
			console.log(movein ? "over" : "out");
			console.log(target);
			var srcElement = target.parentElement;
			var src = findSrc(aim);
			if(src.next){
				console.log(src);
				var destElement = findTitle(src.next);
					tag([srcElement,destElement],movein,"matchTip");	
			}
		}else if(action === "match_dest"){
			var destElement = target;

			var srcAim = findOptionByDest(Number(aim));
			var optionElement = findOption(srcAim);

			if(optionElement){
				tag([optionElement.parentElement,destElement],movein,"matchTip");
			}
		}
	}	
}

function findOptionByDest( id ){
	var questions = Page.questions;
	for(var i=0,l=questions.length; i<l ;i++) {
		var data = questions[i].data;
		if(data){
			for(var j=0,jLength = data.length; j < jLength; j++){
				if(""+id === ""+data[j].next){
					return ""+i+"_"+j;
				}
			}
		}
	}
	return null;
}

function findOption(aim){
	var selector = "#option_"+aim;
	var srcElement = document.querySelector(selector);
	return srcElement;
}

function findTitle(id){
	return document.querySelector("#title_"+id);
}

var Match = {
	src:"",

	start: function(src,target){
		Match.src = src;
		// if(!target.checked){
		// 	var src = Match._findSrc();
		// 	unlink(src);
		// 	Match._tag(src,false,"matchActive");
		// }else{
			var dest = Match._findAllDest();
			Match._tag(dest,true,"matchActive");	
		// }
		
	},
	end: function(aim){
		Match.src = aim;
		var srcElement = findOption(Match.src);
		srcElement.checked = false;
		var src = Match._findSrc();
		var dest = document.querySelector("#title_"+src.next);
		Match._tag([srcElement.parentElement,dest],false,"matchTip");
		unlink(src);

		

	},
	finish: function(dest){
		
		if(dest && Match.src){
			var src = Match._findSrc();
			link(src,dest);			
		}
		var dest = Match._findAllDest();
		Match._tag(dest,false,"matchActive");

	},
	_findSrc: function(){
		return findSrc(Match.src);
	},
	_findAllDest: function(){
		var matchDest = document.querySelectorAll(".matchDest");
		return Array.prototype.slice.call(matchDest,0);
	},
	_tag: function(list,add,claz){
		tag(list,add,claz);	
	}
};

function tag(obj,add,claz){
	if(obj instanceof Array){
		[].forEach.call(obj,function(dest){
			if(dest){
				if(add){
					dest.classList.add(claz);
				}else{
					dest.classList.remove(claz);
				}				
			}

		});	
	}else{
		if(add){
			obj.classList.add(claz);
		}else{
			if(obj.classList){
				obj.classList.remove(claz)
			}
		}
}
}

function findSrc(aim) {
	var srcArray = aim.split("_");
	var questionIndex = Number(srcArray[0]);
	var optionIndex = Number(srcArray[1]);
	return Page.questions[questionIndex].data[optionIndex];
}

function link(src,dest){
	src.next = dest;
}
function unlink(src){
	delete src.next;
}
function findQuestion(index){
	return Page.questions[index];
}

function hasClass(element,claz){
	var reg = new RegExp("(?:^|\\s)"+claz+"(?!\\S)","g");
	return reg.test(element.className);
}

function editQuestion(question,brandnew,index){
	var data = {
			config: { 
						brandnew : brandnew,
						index : index
				   	},
			question:
				question
		};
	compileAndSet(question.type,data,"#editor")
}

function addOption(){
	var container = document.querySelector("#editor ul");
	var sizeOfLi = container.querySelectorAll("li").length;
	var optionStr = compile("_option",{i:1+sizeOfLi});
	var optionDom = parseDom(optionStr)[0];
	container.appendChild(optionDom);
}

function parseDom(str){
	var temp = document.createElement("div");
	temp.innerHTML = str;
	return temp.childNodes;
}

function buildQuestion(){
	var blank = {};

	var editor = document.querySelector("#editor");
	var data_defs = editor.querySelectorAll("[data-def]");
	for(var i=0,length=data_defs.length;i<length;i++){
		var data_def = data_defs[i];
		var def_type = data_def.getAttribute("data-def");
		if("option" === def_type){
			addOptionToQuestion(blank,{"title":data_def.value});
		}else{
			blank[def_type] = data_def.value;	
		}
		
	}
	return blank;
}
function addQuestion(){
	var blank = buildQuestion();
	Page.questions.push(blank);

	compileAndSet("play_ground",Page,"#play_ground");
}

function addOptionToQuestion(obj,option){
	if(!obj.data){
		obj.data = [];
	}
	obj.data.push(option);
}

function compileAndSet(template,data,dest){
	var play_ground_content = compile(template,data);
	var play_ground = document.querySelector(dest);
	play_ground.innerHTML = play_ground_content;
}

function compile(template,data){
	return new EJS({url:"templates/"+template}).render(data);
}


function initObject(type){
	var init_object = {
		text:{

		},
		radio:{
			data:[
			{},
			{},
			{},
			{}
			]
		},
		checkbox:{
			data:[
			{},
			{},
			{},
			{}
			]
		},
		vote:{
			data:[
			{},
			{},
			{},
			{}
			]
		}

	};

	var object = init_object[type];
	object.type = type;
	object.title = "";
	return object;
} 

var PageType = {
	t1:"单步",
	t2:"单页"
};
var Page = {
	title:"nxf",
	type:PageType.t1,
	questions:[
	{
		type:"text",
		title:"请告诉我们你周围有多少朋友在使用微店"
	},
	{
		type:"radio",
		title:"你是从哪里知道微店的？",
		data:[
			{
				title: "网络",
				id:3
			},
			{
				title: "朋友圈",
				id:2
			},
			{
				title:"电视上",
				id:1,
				next:2
			}
		]
	},
	{
		type:"checkbox",
		title:"你的朋友用微店来销售什么？",
		data:[
			{
				title: "鞋子",
				id:3
			},
			{
				title: "衣服",
				id:2
			},
			{
				title:"食品",
				id:1
			}
		]
	},
	{
		type:"matrix",
		title:"你怎么评价微店？",
		data:{
			columns: [
				"很不满意",
				"不满意",
				"一般",
				"满意",
				"很满意"
			],
			rows: [
				{
					title: "鞋子",
					id:3
				},
				{
					title: "衣服",
					id:2
				},
				{
					title:"食品",
					id:1
				}
			]
		}
	},
	{
		type:"vote",
		title:"投票题：你更喜欢哪个微商平台？",
		data:[
			{
				title: "微店",
				id:3
			},
			{
				title: "微盟",
				id:2
			},
			{
				title:"拍拍",
				id:1
			}
		]
	}
	]
};
// Page.prototype = new Object();
// Page.prototype.findQuestion = function(index) {
// 	return this.questions[index];
// };



(function init(){
	compileAndSet("play_ground",Page,"#play_ground");

})();





