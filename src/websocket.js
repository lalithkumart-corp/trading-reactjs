const SOCKET_SERVER_URL = 'wss://api-pub.bitfinex.com/ws/2';
let stream;

export default class MyWebSocket {
    constructor() {
        if(stream)
            return stream;
        else
            return this.open();
    }
    open() {
        stream = new WebSocket(SOCKET_SERVER_URL);
        return stream;
    }
}