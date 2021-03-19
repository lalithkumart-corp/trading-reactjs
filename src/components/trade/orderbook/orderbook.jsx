import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './orderbook.scss';
import { FaAngleDown, FaAngleRight, FaSearchPlus, FaSearchMinus, FaBell, FaMinus, FaPlus, FaWindowMaximize } from 'react-icons/fa';
import MyWebSocket from '../../../websocket';
import { currencyFormatterOld, numberFormatter } from '../../../utils';

const CHANNEL_INFO = {
    "event": "subscribe",
    "channel": "book",
    "symbol": "tBTCUSD"
};
const ONE_SEC = 1000;
const FIVE_SEC = 5000;

export default class Orderbook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calls: [],
            puts: [],
            raw: [],
            callSum: 0,
            putSum: 0,
            totalSum: 0,
            isCollapsed: false,
            isRealTime: true
        }
        this.msgQueue = [];
        this.bindMethods();
    }
    bindMethods() {
        this.onClickThrottleBtn = this.onClickThrottleBtn.bind(this);
    }
    componentDidMount() {
        let ws = new MyWebSocket();
        ws.onopen = () => {
            console.log('WS Open');
            ws.send(JSON.stringify(CHANNEL_INFO));
        };
        ws.onmessage = (msg) => {
            let parsedMsg = JSON.parse(msg.data);
            this.msgQueue.push(parsedMsg);
        }
        this.setupThrottler(this.state.isRealTime?ONE_SEC:FIVE_SEC);
    }

    setupThrottler(secs) {
        this.throttleInterval = setInterval(() => {
            if(this.msgQueue.length) {
                if(this.msgQueue.length >20)
                    this.msgQueue = this.msgQueue.slice(20);
                let tmp = JSON.parse(JSON.stringify(this.msgQueue));
                this.msgQueue = [];
                let newState = {...this.state};
                for(let i=0; i<tmp.length; i++) {
                    newState = this.processMsg(tmp[i], newState);
                }
                this.setState(newState);
            }
        }, secs);
    }

    processMsg(parsedMsg, newState) {
        if(Array.isArray(parsedMsg)) {
            parsedMsg = this.removeChannelId(parsedMsg) // tt.shift()
            newState.sum = 0;
            newState = this.handleData(newState, parsedMsg[0]); //parsedMsg[0] //[this.throttledMsgs]
            newState = this.injectSumValue(newState);
        }
        return newState;
    }

    removeChannelId(parsedMsg) {
        parsedMsg.shift();
        return parsedMsg;
    }

    handleData(stateObj, msgArr) {
        if(msgArr.length != 0) {            
            if(Array.isArray(msgArr[0])) {
                for(let i=0; i<msgArr.length; i++) {
                    return this.handleData(stateObj, msgArr[i]);
                }
            } else {
                if(msgArr[2] >= 0) {
                    stateObj.callSum = 0;
                    if(stateObj.calls.length >= 20)
                        stateObj.calls.shift(); //removes item from first index
                    stateObj.calls.push({price: msgArr[0], count: msgArr[1], amount: msgArr[2]});
                } else {
                    stateObj.putSum = 0;
                    if(stateObj.puts.length >= 20)
                        stateObj.puts.shift(); //removes item from first index
                    stateObj.puts.push({price: msgArr[0], count: msgArr[1], amount: (msgArr[2]*-1)});
                }
            }
        }
        return stateObj;
    }

    injectSumValue(stateObj) {
        stateObj.sum = 0;
        if(!stateObj.callSum) {
            for(let i=0; i<stateObj.calls.length; i++) {
                let anItem = stateObj.calls[i];
                stateObj.callSum = anItem.sum = stateObj.callSum + anItem.amount;
            }
        }
        if(!stateObj.putSum) {
            for(let i=0; i<stateObj.puts.length; i++) {
                let anItem = stateObj.puts[i];
                stateObj.putSum = anItem.sum = stateObj.putSum + anItem.amount;
            }
        }
        stateObj.totalSum = stateObj.callSum + stateObj.putSum;
        return stateObj;
    }

    onClickCardHeader() {
        this.setState({isCollapsed: !this.state.isCollapsed});
    }

    async onClickThrottleBtn() {
        await this.setState({isRealTime: !this.state.isRealTime});
        clearInterval(this.throttleInterval);
        this.setupThrottler(this.state.isRealTime?ONE_SEC:FIVE_SEC);
    }

    getDom(identifier) {
        let buffer = [];
        if(identifier == 'calls') {
            buffer.push(
                <Row className="table-header-row">
                    <Col xs={2} className="table-header">COUNT</Col>
                    <Col xs={4} className="table-header">AMOUNT</Col>
                    <Col xs={4} className="table-header">TOTAL</Col>
                    <Col xs={1} className="table-header">PRICE</Col>
                </Row>
            );
        } else {
            buffer.push(
                <Row className="table-header-row">
                    <Col xs={2} className="table-header">PRICE</Col>
                    <Col xs={4} className="table-header">TOTAL</Col>
                    <Col xs={4} className="table-header">AMOUNT</Col>
                    <Col xs={2} className="table-header">COUNT</Col>
                </Row>
            )
        }
        for(let i=0; i<this.state[identifier].length; i++) {
            let graphWidth = (this.state[identifier][i].sum/this.state.totalSum)*100;
            if(identifier == 'calls') {
                buffer.push(
                    <Row key={`a-row-${i}-call`}>
                        <Col xs={2} className="no-padding a-cell">{this.state[identifier][i].count}</Col>
                        <Col xs={4} className="no-padding a-cell">{numberFormatter(this.state[identifier][i].amount)}</Col>
                        <Col xs={4} className="no-padding a-cell">{numberFormatter(this.state[identifier][i].sum)}</Col>
                        <Col xs={2} className="no-padding a-cell">{currencyFormatterOld(this.state[identifier][i].price)}</Col>
                        <span style={{width: `${graphWidth}%`, backgroundColor: 'rgb(39 119 96)', right: 0}} className="bg-graph"></span>
                    </Row>
                );
            } else {
                buffer.push(
                    <Row key={`a-row-${i}-put`}>
                        <Col xs={2} className="no-padding a-cell">{currencyFormatterOld(this.state[identifier][i].price)}</Col>
                        <Col xs={4} className="no-padding a-cell">{numberFormatter(this.state[identifier][i].sum)}</Col>
                        <Col xs={4} className="no-padding a-cell">{numberFormatter(this.state[identifier][i].amount)}</Col>
                        <Col xs={2} className="no-padding a-cell">{this.state[identifier][i].count}</Col>
                        <span style={{width: `${graphWidth}%`, backgroundColor: '#843b3b'}} className="bg-graph"></span>
                    </Row>
                );
            }
        }
        return buffer;
    }
    getFooter() {
        return (
            <Row>
                <Col xs={3}>
                    <span className="expand-icon"><FaWindowMaximize /></span>
                </Col>
                <Col xs={9} style={{textAlign: 'right'}}>
                    <span className="full-book">
                        <a href="#">FULL BOOK</a>
                    </span>
                    <span className="realtime-status">
                        <span onClick={this.onClickThrottleBtn}>
                            <span className={`throttle-signal ${this.state.isRealTime?"realTime":"throttled"}`}></span>
                            {this.state.isRealTime ? <>Real Time</> : <>Throttled 5S </>}
                        </span>
                    </span>
                </Col>
            </Row>
        )
    }

    render() {
        return (
            <Container className="orderbook-container">
                <Row className="overflow-auto">
                    <Col xs={12} md={12} style={{minWidth: '700px'}}>
                        <Row className="comp-header-bar" onClick={this.onClickCardHeader.bind(this)}>
                            {/* <div > */}
                                <Col xs={6} style={{paddingLeft: '5px'}}>
                                    <span style={{paddingRight: '5px'}}>{this.state.isCollapsed?<FaAngleRight />:<FaAngleDown />}</span>
                                    <span className="title">ORDER BOOK </span>
                                    <span className="symbol">BTC/USD</span>
                                </Col>
                                <Col xs={6}>
                                    <div className="actions-area" style={{textAlign: 'right'}}>
                                        <span className="header-icon"><FaMinus /></span>
                                        <span className="header-icon"><FaPlus /></span>
                                        <span className="header-icon"><FaBell /></span>
                                        <span className="header-icon"><FaSearchMinus /></span>
                                        <span className="header-icon"><FaSearchPlus /></span>
                                    </div>
                                </Col>
                            {/* </div> */}
                        </Row>
                        <Row className={`collapsible-div ${this.state.isCollapsed?'closed':'open'}`}>
                            <Col xs={6} md={6}>
                                {this.getDom('calls')}
                            </Col>
                            <Col xs={6} md={6}>
                                {this.getDom('puts')}
                            </Col>
                            <Col xs={12} className="footer-col">
                                {this.getFooter()}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        )
    }
}
