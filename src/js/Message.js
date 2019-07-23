
class Message{
    constructor(msg, tags=[],count=0){
        if(typeof(msg) != 'string')
            return;
        this.msg = msg;
        this.count=count;
        this.tags =tags;
    }
    compare(othermsg)
    {
        if(!othermsg) return false;
        if(this.msg === othermsg.msg)
        {
            return true;
        }
        if(this.tags.length >0 && this.tags.length === othermsg.tags.length)
        {
            let isSame = true;
            for( let i =0; i < this.tags.length; i++)
            {
                if(this.tags[i] !== othermsg.tags[i] )
                {
                    isSame = false;
                    break;
                }
            }
            if(isSame)
                return true;
            
        }
        return false;
    }

    getType()
    {
        return "Message";
    }
    
}
export default Message;