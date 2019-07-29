export class Item {
  constructor(name, type, icon, tags, stackLimit, stack) {
    this.name = name;
    this.type = type;
    this.icon = icon;
    this.tags = tags;
    this.stackLimit = stackLimit;
    this.stack = Math.min(stack, stackLimit);
  }


}

export class Equippable extends Item {
  constructor(name, type, icon, tags, stackLimit = 1, stack = 1) {
    super(name, type, icon, tags, stackLimit, stack);
    this.canEquip = true;
  }
}

export class Crystal extends Equippable{
    constructor(name, type, icon, tags, stats)
    {
        super(name, type, icon, tags);
        this.stats = stats;
    }
}

export default {Item, Equippable, Crystal};