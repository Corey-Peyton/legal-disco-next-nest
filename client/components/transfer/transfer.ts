import { Button } from 'element-ui';
import Emitter from 'element-ui/src/mixins/emitter';
import Locale from 'element-ui/src/mixins/locale';
import Migrating from 'element-ui/src/mixins/migrating';
import { Component, Prop, Vue } from 'vue-property-decorator';
import TransferPanel from './transfer-panel.vue';

@Component({
  name: 'ElTransfer',
  mixins: [Emitter, Locale, Migrating],
  components: {
    Button, TransferPanel
  }
})
export default class Transfer extends Vue {

  get dataObj(): any {
    const key = this.props.key;

    return this.data.reduce((o, cur) => (o[cur[key]] = cur) && o, {});
  }

  get hasButtonTexts() {
    return this.buttonTexts.length === 2;
  }

  get sourceData() {

    if (this.keepSelectedSourceData) {
      return this.data;
    }

    return this.data.filter(
      (item) => this.value.indexOf(item[this.props.key]) === -1
    );
  }

  get targetData() {
    if (this.targetOrder === 'original') {
      const itemsToBeMoved: any[] = [];
      this.recursiveAddData(this.data, itemsToBeMoved, true);

      return itemsToBeMoved;
    } else {
      return this.value.reduce((arr, cur) => {
        const val = this.dataObj[cur];
        if (val) {
          arr.push(val);
        }

        return arr;
      },                       []);
    }
  }

  @Prop({ default: [] })
  buttonTexts!: any[];

  @Prop({ default: [] })
  data!: [];

  @Prop()
  filterable!: boolean;

  @Prop()
  filterMethod!: (query: any, item: any) => any;

  @Prop({ default: '' })
  filterPlaceholder!: string;

  @Prop({ default: {} })
  format!: any;

  @Prop()
  keepSelectedSourceData!: boolean;

  leftChecked: any[] = [];

  @Prop({ default: [] })
  leftDefaultChecked!: [];

  @Prop({ default: { label: 'label', key: 'key', disabled: 'disabled' } })
  props!: { key: string };

  @Prop()
  renderContent!: (h: any, options: any) => any;
  rightChecked = [];

  @Prop({ default: [] })
  rightDefaultChecked!: [];

  @Prop({ default: 'original' })
  targetOrder!: string;

  @Prop({ default: [] })
  titles!: [];

  @Prop({ default: 'none' })
  treeData!: string;

  @Prop({ default: [] })
  value!: any[];

  addToLeft() {
    const currentValue = this.value.slice();
    this.rightChecked.forEach((item) => {
      const index = currentValue.indexOf(item);
      if (index > -1) {
        currentValue.splice(index, 1);
      }
    });
    this.$emit('input', currentValue);
    this.$emit('change', currentValue, 'left', this.rightChecked);
  }

  addToRight() {
    let currentValue = this.value.slice();
    const itemsToBeMoved: any[] = [];

    this.recursiveAddData(this.data, itemsToBeMoved, false);

    currentValue =
      this.targetOrder === 'unshift'
        ? itemsToBeMoved.concat(currentValue)
        : currentValue.concat(itemsToBeMoved);
    this.$emit('input', currentValue);
    this.$emit('change', currentValue, 'right', this.leftChecked);
  }

  clearQuery(which: string) {
    if (which === 'left') {
      (this.$refs.leftPanel as any).query = '';
    } else if (which === 'right') {
      (this.$refs.rightPanel as any).query = '';
    }
  }

  getMigratingConfig() {
    return {
      props: {
        'footer-format': 'footer-format is renamed to format.'
      }
    };
  }

  onSourceCheckedChange(val: never[], movedKeys: null, isSelected: any) {
    this.leftChecked = val;
    this.addToRight();
    if (movedKeys === null) {
      return;
    }
    this.$emit('left-check-change', val, movedKeys, isSelected);
  }

  onTargetCheckedChange(val: never[], movedKeys: null) {
    this.rightChecked = val;
    if (movedKeys === null) {
      return;
    }
    this.$emit('right-check-change', val, movedKeys);
  }

  recursiveAddData(items: any[], itemsToBeMoved: any[], fullDataItem: boolean) {

    if (items === null) {
      return;
    }

    const key = this.props.key;

    items.forEach((item) => {
      const itemKey = item[key];
      if (this.leftChecked.indexOf(itemKey) > -1) {
        if (fullDataItem) {
          itemsToBeMoved.push(item);
        } else {
          itemsToBeMoved.push(itemKey);
        }
      }

      this.recursiveAddData(item.children, itemsToBeMoved, fullDataItem);
    });
  }
}
