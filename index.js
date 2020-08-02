const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const http = require('https')
//must set maxsocket, otherwise will get err
http.globalAgent.maxSockets = 100
const query = require('./cheerio')

/*
step 1: 
just go to the website of 'https://www.biquge.com.cn'
and find a novel which you want to download.
then,replace the titleUrl to website page url  below

step 2: npm i 

step 3: node index.js
 */
const titleUrl = 'https://www.biquge.com.cn/book/23488/'

//get chapter table
function getTitle(urlTitle) {
	return new Promise((resolve, reject) => {
		http.get(urlTitle, (res) => {
			let content = ''
			res.on('data', (chunk) => {
				content += chunk
			})
			res.on('end', (err) => {
				if (err) throw reject(err)
				//返回的是整段的html
				resolve(content)
			})
		})
	})
}

// sent request,get every chapters url
function sentReq(url) {
	return new Promise((resolve, reject) => {
		request(url, function (err, res, body) {
			if (!err && res.statusCode == 200) {
				// 拿到每个章节的标题
				let $ = cheerio.load(body)
				let booksName = $('.bookname').find('h1').text()
				let detail = $('#content')
					.text()
					.replace(/\s+\r\n\r\n&emsp;&emsp;&emsp;&emsp;/gi, '')
				// console.log(booksName)
				let chapterInfo = {
					chapterTitle: booksName,
					content: detail,
				}
				resolve(chapterInfo)
			} else {
				reject(err)
				// console.log('err:' + err)
			}
		})
	})
}

//--------------------
getTitle(titleUrl).then((value) => {
	//使用cheerio，拿到所有的章节连接，进行拼接
	//返回值是每个章节的请求地址
	// console.log(value)
	let urlList = query(value)
	// console.log(urlList)

	//use map() method to keep sent request
	let contentArr = urlList.map((x) => {
		return sentReq(x)
	})
	console.log(contentArr)

	//let all requestes are come back in order
	Promise.all(contentArr)
		.then((value) => {
			console.log(value)
			for (let i = 0; i < value.length; i++) {
				fs.appendFileSync(
					'noval.txt',
					`|=>|=>|=>|=>|${value[i].chapterTitle}=>${value[i].content}`
				)
			}
		})
		.catch((err) => {
			console.log(err)
		})
})
