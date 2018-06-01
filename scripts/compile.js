const fs = require('fs-extra')
const path = require('path')
const solc = require('solc')

// 1. cleanup
const compiledDir = path.resolve(__dirname, '../compiled')
fs.removeSync(compiledDir)
fs.ensureDirSync(compiledDir)

// compile
// const contractPath = path.resolve(__dirname, '../contracts', 'Car.sol')
// const contractSource = fs.readFileSync(contractPath, 'utf8')

// const result = solc.compile(contractSource, 1)
// console.log(result)

// 2. search all contracts
const contractFiles = fs.readdirSync(path.resolve(__dirname, '../contracts'));

console.log(contractFiles)

contractFiles.forEach(contractFile => {
  // 2.1 compile
  const contractPath = path.resolve(__dirname, '../contracts', contractFile)
  const contractSource = fs.readFileSync(contractPath, 'utf8')
  const result = solc.compile(contractSource, 1)
  console.log(`file compiled: ${contractFile}`)

  // 2.2 check errors
   if (Array.isArray(result.errors) && result.errors.length) {
      throw new Error(result.errors[0]);
   }

  // 2.3 save to disk
  // save to disk
  Object.keys(result.contracts).forEach(name => {
    const contractName = name.replace(/^:/, '')
    const filePath = path.resolve(__dirname, '../compiled', `${contractName}.json`)
    fs.outputJsonSync(filePath, result.contracts[name]);
    console.log(`save compiled contract ${contractName} to ${filePath}`)
  })
})



