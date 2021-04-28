import { QueryGroup as QueryGroup2 } from '@/models/query-group';
import { QueryRule as QueryRule2 } from '@/models/query-rule';
import { CommonCRUDService } from '@/services/common-crud-service/common-crud-service';
import { SetAttributeValuesWithWhere } from '@/services/common-crud-service/set-attribute-values-with-where';
import { Button, Input, Option, Select } from 'element-ui';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Condition } from '../../enums/condition';
import { Operation } from '../../enums/operation';
import { TreeData } from '../../extended-types/tree-data';
// tslint:disable-next-line: no-default-import
import BasicRule from './basic-rule.vue';

// TODO: Need to handle case when there is And or operation is there.
@Component({
    name: 'node',
    components: {
        ElSelect: Select, ElOption: Option, BasicRule, ElButton: Button, ElInput: Input
    }
})
// tslint:disable-next-line: no-default-export
export default class QueryNode extends Vue {

    condition = Condition;

    @Prop()
    filterTreeData?: TreeData[];

    @Prop({ default: () => null })
    rule?: QueryGroup2;

    @Prop({ default: false })
    simple?: boolean;

    addGroup() {

        const queryGroup = {
            id: null,
            condition: Condition.And,
            queryRule: [] as QueryRule2[],
            isGroup: true,
            rules: [],
        } as unknown as QueryGroup2;

        if (!this.rule!.rules) {
            this.rule!.rules = [];
        }

        this.rule!.rules.push(queryGroup);

        if (this.rule!.id) {
            CommonCRUDService.fieldsUpsert('queryGroup', {
                parentQueryGroupId: this.rule!.id,
                condition: Condition.And,
                displayOrder: this.rule?.rules.length! - 1
            })
                .then((id: number) => {
                    queryGroup.id = id;
                });
        }
    }

    addRule() {

        const queryRule = {
            id: 0,
            operation: Operation.EqualTo,
            value: null
        };

        if (!this.rule!.rules) {
            this.rule!.rules = [];
        }

        this.rule!.rules.push(queryRule as unknown as QueryRule2);

        if (this.rule!.id) {
            CommonCRUDService.fieldsUpsert('queryRule', {
                parentQueryGroupId: this.rule!.id,
                displayOrder: this.rule?.rules.length! - 1
            })
                .then((id: number) => {
                    queryRule.id = id;
                });
        }
    }

    deleteGroup(groupIndex: number) {

        if (this.rule!.id) {
            CommonCRUDService.delete('queryGroup', {
                id: this.rule!.rules[groupIndex].id
            });
            this.updateOrderOnDelete(groupIndex);
        }

        this.rule!.rules.splice(groupIndex, 1);
    }

    deleteRule(ruleIndex: number) {

        if (this.rule!.id) {
            CommonCRUDService.delete('queryRule', {
                id: this.rule!.rules[ruleIndex].id
            });
            this.updateOrderOnDelete(ruleIndex);
        }

        this.rule!.rules.splice(ruleIndex, 1);
    }

    updateOrderOnDelete(deleteIndex: number) {
        const setAttributeValuesWithWhere = Array<SetAttributeValuesWithWhere>();

        this.rule?.rules.splice(deleteIndex)
            .forEach((rule, index) => {

                const entity = (rule as QueryGroup2).isGroup ? 'queryGroup' : 'queryRule';

                setAttributeValuesWithWhere.push({
                    entity,
                    setAttributeValues: {
                        displayOrder: index
                    },
                    whereAttributeValues: {
                        id: rule.id
                    }
                });

            });

        CommonCRUDService.fieldsBulkUpsert('queryGroup', setAttributeValuesWithWhere);

    }
}
