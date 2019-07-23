//singleton that checks if an observer exists
//if not it makes one.
class SuperObserver{

    constructor()
    {
        if(SuperObserver.instance)
        return SuperObserver.instance;
        else
        {
            SuperObserver.instance = this;
            this.events = {};
            return this;
        }
    }
    add(name, ref)
    {
        this.events[name] = ref;
    }
    get(name)
    {
        if(name in this.events)
            return this.events[name];
        this.events[name] = new Observer(name);
        return this.events[name];
    }
    static superObserver()
    {
        return SuperObserver.instance;
    }
}

//observer class
class Observer{
    constructor(name)
    {

        this.eventName = name;
        this.subscribers = {};

        
    }
    static subscribe(eventName,subName, callback)
    {
        if(SuperObserver.superObserver() == null)
            new SuperObserver();
        SuperObserver.superObserver().get(eventName)
            .subscribe(eventName,subName, callback)
    }
    subscribe(eventName,subName, callback){
        if(!callback){
            throw new Error("No call back.");
        }
        this.subscribers[subName] = callback;
    }
    static unsubscribe(eventName, subName)
    {
        
        if(SuperObserver.superObserver() == null)
            new SuperObserver()
        SuperObserver.superObserver().get(eventName)
            .unsubscribe(eventName,subName)
    }
    unsubscribe(eventName, subName)
    {
        if (subName in this.subscribers)
        delete this.subscribers[subName]
    }
    static notify(eventName, update)
    {
        if(SuperObserver.superObserver() == null)
            new SuperObserver()
        SuperObserver.superObserver().get(eventName)
            .notify(update)
    }
    notify(update)
    {
        let o =this.subscribers;
        Object.keys(o).forEach(function(key, index) {
            let func = o[key];
            
            try{
                func(update);
            }
            catch(error)
            {
                console.error("Observer notification error.");
                console.error(error);
            }
        });
    }
}
export default Observer;