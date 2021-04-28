import { findAllByPropValue } from '@/methods/find';
import { eventBus } from '@/services/event-bus';
import {
  Checkbox, CheckboxGroup, Input, Tree
} from 'element-ui';
import Locale from 'element-ui/src/mixins/locale';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  mixins: [Locale],
  components: {
    CheckboxGroup, Checkbox, ElInput: Input,
    OptionContent: {
      props: {
        option: Object
      },
      render(h: any): any {
        const getParent = (vm: Vue): any => {
          if (vm.$parent) {
            return getParent(vm.$parent);
          }

          return vm;

        };
        const panel = getParent(this);
        const transfer = panel.$parent || panel;

        return panel.renderContent ? (
          panel.renderContent(h, this.$options)
        ) : (
            transfer.$scopedSlots.default({ option: this.$options })
          );
      }
    }
  }
})
export default class TransferPanel extends Vue {

  get checkableData() {
    return this.filteredData.filter((item) => !item[this.disabledProp]);
  }

  get checkedSummary() {
    const checkedLength = this.checked.length;
    const dataLength = this.data.length;
    const { noChecked, hasChecked } = this.format;
    if (noChecked && hasChecked) {
      return checkedLength > 0
        ? hasChecked
          .replace(/\${checked}/g, checkedLength.toString())
          .replace(/\${total}/g, dataLength.toString())
        : noChecked.replace(/\${total}/g, dataLength.toString());
    }

    return `${checkedLength}/${dataLength}`;

  }

  get disabledProp() {
    return this.props.disabled || 'disabled';
  }

  get filteredData() {
    return this.data.filter((item) => {
      if (typeof this.filterMethod === 'function') {
        return this.filterMethod(this.query, item);
      }

      const label = ((item[this.labelProp] || (item[this.keyProp])) as string).toString();

      return label.toLowerCase()
        .indexOf(this.query.toLowerCase()) > -1;

    });
  }

  get hasFooter() {
    return !!this.$slots.default;
  }

  get hasNoMatch() {
    return this.query.length > 0 && this.filteredData.length === 0;
  }

  get inputIcon() {
    return this.query.length > 0 && this.inputHover
      ? 'circle-close'
      : 'search';
  }

  get isIndeterminate() {
    const checkedLength = this.checked.length;

    return checkedLength > 0 && checkedLength < this.checkableData.length;
  }

  get keyProp() {
    return this.props.key || 'key';
  }

  get labelProp() {
    return this.props.label || 'label';
  }
  allChecked = false;
  checkChangeByUser = true;

  checked: any[] = [];

  @Prop({ default: [] })
  data!: [];

  @Prop()
  defaultChecked!: [];

  @Prop()
  filterable!: boolean;

  @Prop()
  filterMethod!: (query: any, item: any) => any;

  @Prop()
  format!: { hasChecked: string; noChecked: string; };
  inputHover = false;

  @Prop({ default: false })
  isTreeData!: boolean;

  @Prop()
  placeholder!: string;

  @Prop()
  props!: { disabled: string; key: string; label: string; };
  query = '';

  @Prop()
  renderContent!: (h: any, options: any) => any;

  @Prop()
  title!: string;

  @Watch('checkableData')
  checkableDataChange() {
    this.updateAllChecked();
  }

  @Watch('checked')
  checkedChange(val: any[], oldVal: string | any[]) {
    this.updateAllChecked();
    if (this.checkChangeByUser) {
      const movedKeys = val
        .concat(oldVal)
        .filter((v: any) => val.indexOf(v) === -1 || oldVal.indexOf(v) === -1);
      this.$emit(
        'checked-change',
        val,
        movedKeys,
        val.length > oldVal.length
      );
    } else {
      this.$emit('checked-change', val);
      this.checkChangeByUser = true;
    }
  }

  clearQuery() {
    if (this.inputIcon === 'circle-close') {
      this.query = '';
    }
  }

  created() {
    // We need to check if by the time default values are already applied then, just update checked.
    this.handleCheckChange();
    // If default values are not yet retrieved, then subscribe to that.
    eventBus.$on('selectedColumnSet', () => {
      this.handleCheckChange();
    });
  }

  @Watch('data')
  dataChange() {
    const checked: any[] = [];
    const filteredDataKeys = this.filteredData.map(
      (item) => item[this.keyProp]
    ) as any[];
    this.checked.forEach((item) => {
      if (filteredDataKeys.indexOf(item) > -1) {
        checked.push(item);
      }
    });
    this.checkChangeByUser = false;
    this.checked = checked;
  }

  @Watch('defaultChecked', { immediate: true })
  defaultCheckedChange(val: any[], oldVal: string | any[]) {
    if (
      oldVal &&
      val.length === oldVal.length &&
      val.every((item: any) => oldVal.indexOf(item) > -1)
    ) {
      return;
    }
    const checked: any[] = [];
    const checkableDataKeys = this.checkableData.map(
      (item) => item[this.keyProp]
    ) as any[];
    val.forEach((item: any) => {
      if (checkableDataKeys.indexOf(item) > -1) {
        checked.push(item);
      }
    });
    this.checkChangeByUser = false;
    this.checked = checked;
  }

  filterNode(value: any, data: { label: string | any[] }) {
    if (!value) { return true; }

    return data.label.indexOf(value) !== -1;
  }

  handleAllCheckedChange(value: any) {
    this.checked = value
      ? this.checkableData.map((item) => item[this.keyProp])
      : [];
  }

  handleCheckChange() {
    this.checked = findAllByPropValue('selectedColumn', true, this.data)
      .map(
        (td) => td.id
      ); // TODO: we need all checked. this will only return one. + we only need id.
  }

  @Watch('query')
  queryChange(val: any) {
    // TODO: Following is not case sensitive. Need to fix it.
    (this.$refs.tree as Tree).filter(val);
  }

  updateAllChecked() {
    const checkableDataKeys = this.checkableData.map(
      (item) => item[this.keyProp]
    );
    this.allChecked =
      checkableDataKeys.length > 0 &&
      checkableDataKeys.every((item) => this.checked.indexOf(item) > -1);
  }
}
