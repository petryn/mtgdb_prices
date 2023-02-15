
const Pick = require('stream-json/filters/Pick');
const {streamObject} = require('stream-json/streamers/StreamObject');
const {chain} = require('stream-chain');
const fs = require('fs');
const progress = require('progress-stream');

const fileName = './data/AllPrices.json';
const currentDate = '2022-10-21';
const outFile = 'out.json';

var writeStream = fs.createWriteStream(outFile);

writeStream.write('{ "data": {');

function getData(obj){
	let newObj = {};

	if(obj.value.paper != undefined){
		try {
			for(const [provider, pdata] of Object.entries(obj.value.paper)){	
				let buyType = {};

				for(const [btype, bdata] of Object.entries(pdata)){
					if(btype == 'currency'){
						continue;
					}
					let typeObj = {};

					for(const [type, data] of Object.entries(bdata)){
						typeObj[type] = data[currentDate];
					}

					buyType[btype] = typeObj;
				}				
				
				if(Object.keys(buyType).length != 0){
					newObj[provider] = buyType;
				}				
			}
		} catch (error) {
			console.error(error);
		}
	}else{
		return null;
	}

	writeStream.write('"'+ obj.key +'":' + JSON.stringify(newObj)+',');
}

var str = progress({
    time: 10000
});
 
str.on('progress', function(progress) {
	console.log(progress);
});

const pipeline = chain([
	fs.createReadStream(fileName).pipe(str),
	Pick.withParser({filter: 'data'}),
	streamObject(),
	data => getData(data)
]);


/*
let allData = {};

pipeline.on('data', d => {

	const uuid = d.key;
	let newObj = {};

	//console.log(d.value.paper.tcgplayer)

	if(d.value.paper != undefined){
		try {
			for(const [provider, pdata] of Object.entries(d.value.paper)){	
				let buyType = {};

				for(const [btype, bdata] of Object.entries(pdata)){
					if(btype == 'currency'){
						continue;
					}
					let typeObj = {};

					for(const [type, data] of Object.entries(bdata)){
						typeObj[type] = data[currentDate];
					}

					buyType[btype] = typeObj;
				}				
				
				newObj[provider] = buyType;
			}
		} catch (error) {
			console.error(error);
		}
	} 	

	allData[uuid] = newObj;
});
*/

pipeline.on('end', () => {
	writeStream.write('}');
});

