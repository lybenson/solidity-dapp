pragma solidity ^0.4.17;


// Solidity 数据类型
// 基本类型: 整型、布尔型、账户地址、枚举等(uint指的是uint256)
// 引用类型: 数组、结构体以及映射等


// 全局变量msg包含了当前交易上的关键信息
// msg.data 交易中携带的数据
// msg.sender 发起交易的账户
// msg.value 交易发送的转账金额(所有的涉及金额的单位都是wei), 单位是wei, 1eth=10^18wei
// 全局变量还有block, now等

// 全局函数require: require 是 Solidity 提供的断言机制，如果传入的条件不满足交易就被回滚，具体到我们的众筹合约，如果各种业务规则检查不通过，接口调用会直接失败

contract Project {

    // using SafeMath for uint; // SafeMath 保证数学运算的安全

    // 资金支出细节
    struct Payment {
        string description; // 资金支出描述
        uint amount; // 支出金额
        address receiver; // 接收人
        bool completed; // 是否已完成
        address[] voters; // 参与资金支出投票的投资人
    }

    address public owner; // 项目所有者(address类型存储有效的以太坊地址, 账户余额 address.balance，发起转账 address.transfer 等)
    string public description; // 项目描述
    uint public minInvest; // 最小投资金额
    uint public maxInvest; // 最大投资金额
    uint public goal; // 融资上限
    address[] public investors; // 投资人列表
    Payment[] public payments; // 资金支出列表

    // 智能合约构造函数, 传入所有合约的基本属性
    constructor(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
        owner = msg.sender;
        description = _description;
        minInvest = _minInvest;
        maxInvest = _maxInvest;
        goal = _goal;
    }

    // 参与项目投资的接口, 投资人调用该接口时要求发送满足条件的资金(payable),并且要求没有达到募资上线
    function contribute() public payable {
        require(msg.value >= minInvest);
        require(msg.value <= maxInvest);

        // address(this).balance, 当前的合约实例转成了 address 类型, 取到合约中的资金余额, 或者直接this.balance, 因为任何合约实例在以太坊上都以账户的形式存在
        uint newBalance = 0;
        newBalance = address(this).balance.add(msg.value);
        require(newBalance <= goal);

        investors.push(msg.sender);
    }

    // 发起资金支出请求，要求传入资金支出的细节信息
    function createPayment(string _description, uint _amount, address _receiver) public {

        require(msg.sender == owner);

        require(address(this).balance >= _amount); // 指定账户余额不大于要转出的金额

        Payment memory newPayment = Payment({
            description: _description,
            amount: _amount,
            receiver: _receiver,
            completed: false,
            voters: new address[](0)
        });

        payments.push(newPayment);
    }

    // 投票赞成某个资金支出请求，需要指定是哪条请求，要求投票的人是投资人，并且没有重复投票
    function approvePayment(uint index) public {
        Payment storage payment = payments[index];

        // must be investor to vote
        bool isInvestor = false;
        for (uint i = 0; i < investors.length; i++) {
            isInvestor = investors[i] == msg.sender;
            if (isInvestor) {
                break;
            }
        }
        require(isInvestor);

        // can not vote twice
        bool hasVoted = false;
        for (uint j = 0; j < payment.voters.length; j++) {
            hasVoted = payment.voters[j] == msg.sender;
            if (hasVoted) {
                break;
            }
        }
        require(!hasVoted);

        payment.voters.push(msg.sender);
    }

    // 完成资金支出, 需要指定是哪笔支出，即调用该接口给资金接收方转账，不能重复转账，并且赞成票数超过投资人数量的 50%；
    function doPayment(uint index) public {

        require(msg.sender == owner);

        Payment storage payment = payments[index];

        require(address(this).balance >= payment.amount); // 指定账户余额不大于要转出的金额

        require(!payment.completed);
        require(payment.voters.length > (investors.length / 2));

        payment.receiver.transfer(payment.amount);
        payment.completed = true;
    }
}
