import { readFile, utils } from 'xlsx'

const readExcelData = src => {
  console.log('src:', src)

  const workbook = readFile(src) // 读取excel文件

  const sheetNames = workbook.SheetNames // 获取所有sheet的名字

  const worksheet = workbook.Sheets[sheetNames[0]] // 获取第一个sheet

  const data = utils.sheet_to_json(worksheet) // 将sheet转换为json数据

  console.log(data) // 打印json数据
}

export { readExcelData }
