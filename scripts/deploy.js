const path = require('path')
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')

/**
 * web3.js中包含的模块:
 * 1. web3-eth: JS和以太坊区块链通信，部署、调用智能合约
 * 2. web3-utils: 提供了大量的工具函数
 * 3. web3-shh: 基于 whisper 协议的 P2P 通信和广播
 * 4. web3-bzz: 基于 swarm 协议的去中心化文件存储
 */

// web3.js 包含了很多插件, 称为provider(类似于webpack中plugin)

// web3.js 通过插件机制和以太坊不同网络通信
// Http Provider: 本地私有网络
// Ganache-cli Provider: Ganache 本地测试网
// Truffle HDWallet Provider: Rinkeby/Mainet

// 1. 拿到 bytecode
const contractPath = path.resolve(__dirname, '../compiled/ProjectList.json')
const { interface, bytecode } = require(contractPath)

// 2. 配置 provider
const provider = new HDWalletProvider(
  'mango april cycle fish lend exist camera list day increase load curve',
  'https://rinkeby.infura.io/qmGi34bScaz0DBAgElib'
)

// eth账户由地址+公钥+私钥组成
// 助记词生成私钥
// 私钥计算出公钥
// 公钥生成地址
// https://img-blog.csdn.net/20170625162235221?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvY2hlbmhhaWZlbmcyMDE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast

// 3. 初始化 web3 实例 (provider包含了助记词, 可以获取到地址)
const web3 = new Web3(provider)

(async () => {
  // 4. 获取钱包里面的账户
  const accounts = await web3.eth.getAccounts();
  console.log('合约部署账户:', accounts[0]);

  // 5. 创建合约实例并且部署
  console.time('合约部署耗时');
  const result = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({ data: bytecode })
      .send({ from: accounts[0], gas: '5000000' });
  console.timeEnd('合约部署耗时');

  const contractAddress = result.options.address;

  console.log('合约部署成功:', contractAddress);
  console.log('合约查看地址:', `https://rinkeby.etherscan.io/address/${contractAddress}`);

  // 6. 合约地址写入文件系统
  const addressFile = path.resolve(__dirname, '../address.json');
  fs.writeFileSync(addressFile, JSON.stringify(contractAddress));
  console.log('地址写入成功:', addressFile);

  process.exit();
})()

deploy()
