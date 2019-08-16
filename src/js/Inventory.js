import Feature from "./Feature";
import Observer from "./Observer";
import ItemList from "./ItemList";
import { binarySearch } from "./globals";

class ItemStorage {
  constructor(size) {
    this.capacity = size;
    this.objects = {};
    this.freeIndex = [];
    for (var i = 0; i < this.capacity; i++) {
      this.freeIndex.push(i);
    }
  }
  increaseCapacity(val){
    this.capacity = val;
  }
  getEmpty() {
    if (this.freeIndex.length === 0) return null;
    return this.freeIndex[0];
  }
  popFreeIndex() {
    return this.freeIndex.splice(0, 1);
  }
  addFreeIndex(index) {
    let bsIndex = binarySearch(this.freeIndex, index);
    
    this.freeIndex.splice(bsIndex, 0, index);
    console.log(this.freeIndex)
  }
  makeItem(itemID, itemName = null) {
    if (this.isFull()) {
      return false;
    }
    let item = ItemList.getItem(itemID);
    if (!item) {
      return false;
    }
    this.objects[this.popFreeIndex()] = item;

    return true;
  }
  get(index)
  {
    if(this.objects[index])
      return this.objects[index];
    else return null;
  }
  addItem(item)
  {
    if(this.isFull()) return false;
    this.objects[this.popFreeIndex()] = item
    return true;
  }
  removeItem(index){
    if(!(index in this.objects)) return false;
    delete this.objects[index]
    this.addFreeIndex(index)
    return true;
  }
  isFull() {
    return this.getEmpty() == null;
  }
  getObjects() {return this.objects}
}

class Inventory extends Feature {
  constructor() {
    super();
    if (Inventory.instance) {
      return Inventory.instance;
    }
    Inventory.instance = this;
    this.capacity = 100;
    // this.InventoryObject = {};
    this.equipmentSlots = 3;
    // this.EquipmentObject ={};
    //*test*//
    this.InventoryContainer = new ItemStorage(100);
    this.EquipmentContainer = new ItemStorage(3);
    this.InventoryContainer.makeItem(0);
    this.InventoryContainer.makeItem(0);
    this.InventoryContainer.makeItem(0);
    this.InventoryContainer.makeItem(0);

    Observer.subscribe("ActivateFeature", "Inventory", featureName => {
      if (featureName === "Inventory") {
        this.featureActive = true;
        // this.add("WindowMode", "Inventory");
        this.sendUpdate();
      }
    });
    Observer.subscribe("InventorySendInfo", "Inventory", () => {
      this.add("content", this.InventoryContainer.getObjects());
      this.add("numSlots", this.capacity);
      this.sendUpdate();
    });
    Observer.subscribe("EquipItem", "Inventory", obj => {
      if (obj.Equip) {
        let item = this.InventoryContainer.get(obj.itemPosition);
        if (!item || !item.canEquip) return;
        if(this.addItemTo(this.EquipmentContainer, "equips", item)){
          this.removeItemFrom(this.InventoryContainer, "content", obj.itemPosition);
          this.sendUpdate();
        }
      } else {
        let item = this.EquipmentContainer.get(obj.itemPosition)
        if(this.addItemTo(this.InventoryContainer, "content", item)){
          this.EquipmentContainer.removeItem(obj.itemPosition)
          this.removeItemFrom(this.EquipmentContainer, "equips", obj.itemPosition);
          this.sendUpdate();
        }
      }
      // console.log(this.InventoryContainer)
      // console.log(this.EquipmentContainer)
    });
  }
  addItemTo(Container,dest, item)
  {
    if(!(Container instanceof ItemStorage)) return;
    let val = Container.addItem(item);
    if(val) {
      this.add(dest, Container.getObjects());
      return true;
    }
    return false;
  }
  removeItemFrom(Container,dest, index)
  {
    if(!(Container instanceof ItemStorage)) return;
    let val = Container.removeItem(index);
    if(val){
      this.add(dest, Container.getObjects());
      return true;
    }
    return false;
  }
  sendUpdate() {
    Observer.notify("InventoryStateChange", this.update);
    this.update = {};
  }
  add(key, val) {
    this.update[key] = val;
  }
}

export default Inventory;
