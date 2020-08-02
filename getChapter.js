const http = require('https')
const fs = require('fs')
const cheerio = require('cheerio')
const request = require('request')

module.exports = function getCapter(url, num) {
	return new Promise((resolve, reject) => {
	
		// 		//改成使用get请求
		http.get(url, (res) => {
			let content = ''
			res.on('data', (chunk) => {
				content += chunk
			})
			res.on(
				'end',
				(err) => {
					if (err) reject(err)
					let $ = cheerio.load(content)
					let booksName = $('.bookname').find('h1').text()
					let detail = $('#content')
						.text()
						.replace(/\s+\r\n\r\n&emsp;&emsp;&emsp;&emsp;/gi, '')
					// console.log(booksName)
					let numbers = {
						id: num,
						chapterTitle: booksName,
						content: detail,
					}
					resolve(numbers)
				},
				500
			)
		})
	})
}
//--------------------------
	// 		//使用request请求
		// 		request(url, function (err, res, body) {
		// 			if (!err && res.statusCode == 200) {
		// 				// 拿到每个章节的标题
		// 				let $ = cheerio.load(body)
		// 				let booksName = $('.bookname').find('h1').text()
		//         // console.log(booksName)
		//         resolve(booksName)

		// 			} else {
		// 				reject(err)
		// 				// console.log('err:' + err)
		// 			}
		// 		})
		// 	})
		// }
