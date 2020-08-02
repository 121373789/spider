const cheerio = require('cheerio')

function booksQuery(body) {
	// console.log(body)
	let list = []
	let numberList = []
	$ = cheerio.load(body)
	$('#list')
		.find('dd')
		.find('a')
		.each(function (i, e) {
			//获取章节UrlList
			list.push($(e).attr('href'))
		})

	for (let i = 0; i < list.length; i++) {
		numberList[i] = 'https://www.biquge.com.cn' + list[i]
	}

	return numberList
}

module.exports = booksQuery
