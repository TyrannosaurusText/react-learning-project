import React from 'react';
import Message from './Message'
import update from 'immutability-helper';
import Observer from './Observer.js'

/*
 * Log Class
 * Specification: renders msg log, holds up to 50 msgs, 
 * repeated msgs are stacked up to 1000 times before overflowing
 * TODO: add filter
*/
let globalLog = null
class Log extends React.Component
{
    constructor(props)
    {
        super(props);
        if(globalLog != null)
        {
            return globalLog;
        }
        globalLog = this;
        this.msgLimit= 50;
        this.msgRepLimit= 0;
        this.msgQueue = [];
        this.state={
            msgQueue:  []
        };
        this.mounted = false;
        this.mesRef = React.createRef();
        Observer.subscribe("LogAddMessage", "Log", (message)=>{this.notifyNewMessage(message)});
    }
    getMsg()
    {
        return this.msg;
    }
    componentDidMount(){
        this.mounted = true;
        if(this.state.msgQueue[0] !== this.msgQueue[0]){        
            this.setState({msgQueue: this.msgQueue});
        }
    }
    componentWillUnmount(){
        this.mounted = false;
    }
    notifyNewMessage(update)
    {
        if( !(update instanceof Message))
            return
        this.addMsg(update);
        
    }
    addMsg(msg)
    {   
        // if( !(msg instanceof Message))
        //     return
        let msgQueueObj = {};
        msgQueueObj["msgQueue"] = this.msgQueue;
        if (msg.compare(this.msgQueue[this.msgQueue.length-1])){
            let count = this.msgQueue[this.msgQueue.length-1].count;
            if(count<this.state.msgRepLimit)
            {
                msg.count = count+1;
                let c = (this.msgQueue.length-1);
                let obj = {};
                obj[c]= {$set: msg};
                this.msgQueue= update(this.msgQueue, obj);

                this.setState(msgQueueObj)
                return
            }
            
        }

        if(this.msgQueue.length > this.state.msgLimit && this.mounted){
            this.msgQueue = update(this.msgQueue, {$splice: [[0,1]]})
        }
            

        this.msgQueue = update(this.msgQueue, {$push: [msg]})

        if(this.mesRef.curren && this.mounted && this.mesRef.current.scrollHeight - this.mesRef.current.scrollTop <= this.mesRef.current.clientHeight+1)
        {
            this.setState({msgQueue: this.msgQueue}, ()=>{
                this.scrollToBottom();
            });
        }
        else if(this.mounted)
        {
            this.setState({msgQueue: this.msgQueue});
        }
    
    }
    scrollToBottom = () => {
		this.mesRef.current.scrollTop = this.mesRef.current.scrollHeight;
    }
    render()
    {
        const msgQueue = this.state.msgQueue;
        
        const listItems = msgQueue.map((msg, count)=>{
            let m = msg.msg + (msg.count?" ("+msg.count+")":"");
            return (<li key={count}>{m}</li>);
        });
        return (<div className="Log" ref={this.mesRef}>
        {listItems}
        <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
        </div>
        </div>)
    }
}
export default Log; 