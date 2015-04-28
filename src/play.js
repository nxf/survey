document.addEventListener("click",function(event){
	var target = event.target;
	tt = target;

	var action = target.getAttribute("data-action");
	console.log(action);
	var matchStart = false;
	if(action){
		var splited_action = action.split("-");
		console.log(splited_action);
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
		}else if("add_row" === action){
			console.log("enter add-row");
			addRow();
		}else if("add_column" === action){
			addColumn();
		}
	}
});

function addRow() {
	var ul = document.querySelector("#editor_row");
	var sizeOfLi = ul.querySelector("li").length;
	var inputStr = compile("_input",{i: 1+sizeOfLi,type:"row"});
	var inputDom = parseDom(inputStr)[0];
	ul.appendChild(inputDom);
}

function addColumn(){
	var ul = document.querySelector("#editor_column");
	var sizeOfLi = ul.querySelector("li").length;
	var inputStr = compile("_input",{i: 1+sizeOfLi,type:"column"});
	var inputDom = parseDom(inputStr)[0];
	ul.appendChild(inputDom);
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
		if("option" === def_type){ //normal
			addOptionToQuestion(blank,{"title":data_def.value});
		}else if ("option_row" === def_type){
			addOptionRowToQuestion(blank,{"title":data_def.value});
		}else if("option_column" === def_type){
			addOptionColumnToQuestion(blank,{"title":data_def.value});
		}else{
			blank[def_type] = data_def.value;	
		}
	}
	return blank;
}

function addOptionRowToQuestion(obj,optionRow){
	if(!obj.rows){
		obj.rows = [];
	}
	obj.rows.push(optionRow);
}
function addOptionColumnToQuestion(obj,optionColumn){
	if(!obj.columns){
		obj.columns = [];
	}
	obj.columns.push(optionColumn);
}


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
	ElementUtils.tip(event,true);
});
document.addEventListener("mouseout",function(event){
	ElementUtils.tip(event,false);
});




var Match = {
	src:"",

	start: function(src,target){
		Match.src = src;
			var dest = ElementUtils.findAllDest();
			ElementUtils.tag(dest,true,"matchActive");	
	},
	end: function(aim){
		Match.src = aim;
		var srcElement = ElementUtils.findOption(Match.src);
		srcElement.checked = false;
		var src = PageUtils.findOptionByAim(Match.src);
		var dest = document.querySelector("#title_"+src.next);
		ElementUtils.tag([srcElement.parentElement,dest],false,"matchTip");
		PageUtils.unlink(src);	
	},
	finish: function(dest){
		if(dest && Match.src){
			var src = PageUtils.findOptionByAim(Match.src);
			PageUtils.link(src,dest);			
		}
		var dest = ElementUtils.findAllDest();
		ElementUtils.tag(dest,false,"matchActive");

	}
};

var ElementUtils = {
	findAllDest: function(){
		var matchDest = document.querySelectorAll(".matchDest");
		return Array.prototype.slice.call(matchDest,0);
	},
	findOption: function(aim){
		var selector = "#option_"+aim;
		var srcElement = document.querySelector(selector);
		return srcElement;
	},
	tag: function(obj,add,claz){
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
	},
	tip: function(event,movein){
		var target = event.target;
		var action = target.getAttribute("data-action");
		if(action){
			var splited_action = action.split("-");
			var action = splited_action[0];
			var aim = splited_action[1];
			if(action === "match_src"){
				var srcElement = target.parentElement;
				var src = PageUtils.findOptionByAim(aim);
				if(src.next){
					var destElement = ElementUtils.findTitle(src.next);
					ElementUtils.tag([srcElement,destElement],movein,"matchTip");	
				}
			}else if(action === "match_dest"){
				var destElement = target;

				var srcAim = PageUtils.findOptionByDest(Number(aim));
				var optionElement = ElementUtils.findOption(srcAim);

				if(optionElement){
					ElementUtils.tag([optionElement.parentElement,destElement],movein,"matchTip");
				}
			}
		}	
	},
	findTitle: function(id){
		return document.querySelector("#title_"+id);
	}
};

var PageUtils = {
	findOptionByAim: function(aim) {
		var srcArray = aim.split("_");
		var questionIndex = Number(srcArray[0]);
		var optionIndex = Number(srcArray[1]);
		var question = Page.questions[questionIndex];
		if("matrix" === question.type){
			if(!question.data){
				question.data = [];
			}
			if(!question.data[optionIndex]){
				question.data[optionIndex] = [];
				question.data[optionIndex][srcArray[2]] = {};
			}
			
			return question.data[optionIndex][srcArray[2]];
		}else{
			return question.data[optionIndex];	
		}
		
	},
	link: function(option,question) {
		option.next = question;
	},
	unlink: function(option){
		delete option.next;
	},
	findQuestion: function(index) {
		return Page.questions[index];
	},
	findOptionByDest: function( id ){
		var questions = Page.questions;
		for(var i=0,l=questions.length; i<l ;i++) {
			var question = questions[i];
			var data = question.data;
			if(data){
				if("matrix" === question.type){
					for(var j=0,jLength = data.length; j < jLength; j++){
						for(var column=0,cl = data[j].length;column<cl;column++){
							if(data[j] && data[j][column] && ""+id === ""+data[j][column].next){
								return ""+i+"_"+j+"_"+column;
							}	
						}
					}
				}else{
					for(var j=0,jLength = data.length; j < jLength; j++){
						if(""+id === ""+data[j].next){
							return ""+i+"_"+j;
						}
					}					
				}

			}
		}
		return null;
	}
};

function compileAndSet(template,data,dest){
	var play_ground_content = compile(template,data);
	var play_ground = document.querySelector(dest);
	play_ground.innerHTML = play_ground_content;
}

function compile(template,data){
	return new EJS({url:"templates/"+template}).render(data);
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
		columns: [
				{
				  title: "很不满意",
				  id: 1
				},
				{ 
				  title:"不满意",
				  id: 2
				},
				{
				  title:"一般",
				  id: 3
				},
				{
				  title: "满意",
				  id: 4
				},
				{
				  title: "很满意",
				  id: 5
				}
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
			],
		data:[
			[
				{},
				{},
				{},
				{},
				{}
			],
			[
				{},
				{},
				{},
				{},
				{}
			],
			[
				{},
				{},
				{},
				{},
				{}
			]
		]
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
		},
		matrix:{
			data:[
				[{},{},{},{}],
				[{},{},{},{}],
				[{},{},{},{}],
				[{},{},{},{}]
			],
		columns: [
				{
				  title: "很不满意",
				  id: 1
				},
				{ 
				  title:"不满意",
				  id: 2
				},
				{
				  title:"一般",
				  id: 3
				},
				{
				  title: "满意",
				  id: 4
				},
				{
				  title: "很满意",
				  id: 5
				}
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

	};

	var object = init_object[type];
	object.type = type;
	object.title = "";
	return object;
} 




(function init(){
	compileAndSet("play_ground",Page,"#play_ground");

})();





