import Feature from "./Feature";
import Observer from "./Observer";
import ItemList from "./ItemList";
import { binarySearch } from "./globals";

class Inventory extends Feature {
  constructor() {
    super();
    if (Inventory.instance) {
      return Inventory.instance;
    }
    Inventory.instance = this;
    this.capacity = 50;
    this.InventoryObject = {};
    //*test*//
    this.freeIndex = [];
    for (var i = 0; i < 50; i++) {
      this.freeIndex.push(i);
    }
    this.addItem(0);
    this.addItem(0);
    this.addItem(0);
    this.addItem(0);
    // console.log(this.InventoryObject);

    Observer.subscribe("ActivateFeature", "Inventory", featureName => {
      if (featureName === "Inventory") {
        this.featureActive = true;
        // this.add("WindowMode", "Inventory");
        this.sendUpdate();
      }
    });
    Observer.subscribe("InventorySendInfo", "Inventory", () => {
      this.add("content", this.InventoryObject);
      this.add("numSlots", this.capacity);
      this.sendUpdate();
    });
  }

  getEmpty() {
    if (this.freeIndex.length === 0) return null;
    return this.freeIndex[0];
  }
  popFreeIndex() {
    return this.freeIndex.splice(0, 1);
  }
  addFreeIndex(index) {
    let bsIndex = binarySearch(index);
    return this.freeIndex.splice(bsIndex, 0, index);
  }
  addItem(itemID) {

    if (this.getEmpty() == null) {
      return false;
    }
    let item = ItemList.getItem(itemID);
    if (!item) {
      return false;
    }
    this.InventoryObject[this.popFreeIndex()] = item;
    this.add("content", this.InventoryObject);
    this.sendUpdate();
  }
  isFull() {
    return this.getEmpty() == null;
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
