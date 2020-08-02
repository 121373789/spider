const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const http = require('https')
//must set maxsocket, otherwise will get err
http.globalAgent.maxSockets = 100
const query = require('./cheerio')
const titleUrl = 'https://www.biquge.com.cn/book/23488/'


// const urlList = [
// 	'https://www.biquge.com.cn/book/31833/489366.html',
// 	'https://www.biquge.com.cn/book/31833/489624.html',
// 	'https://www.biquge.com.cn/book/31833/725924.html',
// 	'https://www.biquge.com.cn/book/31833/728234.html',
// 	'https://www.biquge.com.cn/book/31833/728644.html',
// 	'https://www.biquge.com.cn/book/31833/728814.html',
// 	'https://www.biquge.com.cn/book/31833/730288.html',
// 	'https://www.biquge.com.cn/book/31833/730733.html',
// 	'https://www.biquge.com.cn/book/31833/732474.html',
// 	'https://www.biquge.com.cn/book/31833/732939.html',
// 	'https://www.biquge.com.cn/book/31833/734834.html',
// 	'https://www.biquge.com.cn/book/31833/735310.html',
// 	'https://www.biquge.com.cn/book/31833/736959.html',
// 	'https://www.biquge.com.cn/book/31833/737389.html',
// 	'https://www.biquge.com.cn/book/31833/739157.html',
// 	'https://www.biquge.com.cn/book/31833/739595.html',
// 	'https://www.biquge.com.cn/book/31833/741234.html',
// 	'https://www.biquge.com.cn/book/31833/741627.html',
// 	'https://www.biquge.com.cn/book/31833/743264.html',
// 	'https://www.biquge.com.cn/book/31833/743699.html',
// 	'https://www.biquge.com.cn/book/31833/745359.html',
// 	'https://www.biquge.com.cn/book/31833/745771.html',
// ]

//请求章节目录函数
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

// sent request,get every chapters data
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
					'shenxu.txt',
					`|=>|=>|=>|=>|${value[i].chapterTitle}=>${value[i].content}`
				)
        
      }
		})
		.catch((err) => {
			console.log(err)
    })
  
  
})
