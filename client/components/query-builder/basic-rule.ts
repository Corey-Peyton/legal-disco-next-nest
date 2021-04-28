import { findById } from '@/methods/find';
import { CommonCRUDService } from '@/services/common-crud-service/common-crud-service';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import {
    Button, DatePicker, Input, InputNumber, Option, Select, Switch
} from 'element-ui';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FieldType } from '../../enums/field-type';
import { Operation } from '../../enums/operation';
import { TreeData } from '../../extended-types/tree-data';
import { QueryRule } from '../../models/query-builder-query';

@Component({
    components: {
        ElSelect: Select, ElOption: Option, Switch, DatePicker, ElInput: Input, InputNumber, ElButton: Button,
        Treeselect
    }
})
// tslint:disable-next-line: no-default-export
export default class BasicRule extends Vue {

    get ruleField(): string | null {

        if (this.simple) {
           return this.selectedFilterTreeData?.id;
        }

        if (this.rule!.fieldId === null || this.rule!.fieldType === null
            || this.rule!.fieldId === null || this.rule!.fieldType === null) {
            return null;
        }

        const selectedVlue = `${this.rule!.fieldType}_${this.rule!.fieldId}`;
        if (this.selectedFilterTreeData === null) {
            this.ruleField = selectedVlue;
        }

        return selectedVlue;
    }
    set ruleField(value: string | null) {
        this.selectedFilterTreeData = findById(value!, this.filterTreeData);
        this.rule!.type = this.selectedFilterTreeData?.fieldType;

        if (this.simple) {
            this.rule!.fieldId = value!;

            return;
        }

        const valueData: number[] = value!.split('_')
            .map(Number);
        this.rule!.fieldType = valueData[0];
        this.rule!.fieldId = valueData[1];
    }

    fieldType = FieldType;

    @Prop()
    filterTreeData?: TreeData[];

    options = [
        { label: 'Equal To', value: Operation.EqualTo },
        { label: 'Not Equal To', value: Operation.NotEqualTo },
        { label: 'Greater Than', value: Operation.GreaterThan },
        { label: 'Greater Than EqualTo', value: Operation.GreaterThanEqualTo },
        { label: 'Less Than', value: Operation.LessThan },
        { label: 'Less Than EqualTo', value: Operation.LessThanEqualTo },
        { label: 'Between', value: Operation.Between },
        { label: 'Contains', value: Operation.Contains },
        { label: 'Does Not Contain', value: Operation.DoesNotContain },
        { label: 'Starts With', value: Operation.StartsWith },
        { label: 'Ends With', value: Operation.EndsWith },
        { label: 'In', value: Operation.In },
        { label: 'Not In', value: Operation.NotIn },
        { label: 'Is Empty', value: Operation.IsEmpty },
        { label: 'Is Not Empty', value: Operation.IsNotEmpty }
    ];

    @Prop({ default: () => null })
    rule?: QueryRule;

    // TODO: Following is not working. Values input are not showing
    selectedFilterTreeData?: TreeData | null = null;

    @Prop({ default: false })
    simple?: boolean;

    saveOperator() {
        if (this.rule?.id) {
            CommonCRUDService.fieldsUpsert(
                'queryRule',
                {
                    operation: this.rule?.operation,
                    fieldId: this.rule?.fieldId
                },
                { id: this.rule?.id });
        }
    }

    saveRule() {
        if (this.rule?.id) {
            CommonCRUDService.fieldsUpsert(
                'queryRule',
                {
                    fieldType: this.rule?.fieldType,
                    fieldId: this.rule?.fieldId
                },
                { id: this.rule?.id });
        }
    }

    // TODO: make this individual methods common. remove repetitive code.
    saveValue() {
        if (this.rule?.id) {
            CommonCRUDService.fieldsUpsert(
                'queryRule', {
                value: this.rule?.value,
                fieldId: this.rule?.fieldId
            },
                { id: this.rule?.id });
        }
    }

}
