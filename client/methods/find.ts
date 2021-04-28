import { TreeData } from 'element-ui/types/tree';

const findByPropValue = (prop: string, value: string, treeData?: TreeData[]): TreeData | null => {
    if (treeData === null || treeData === undefined) {
        return null;
    }
    for (const nodeData of treeData) {
        if ((nodeData as any)[prop] === value) {
            return nodeData;
        }

        const result = findByPropValue(prop, value, nodeData.children);
        if (result !== null) {
            return result;
        }
    }

    return null;
};

// TODO: Need to use Lodash. Can't make methods which is generally available.
const findById = (id: string, treeData?: TreeData[]): TreeData | null =>
    findByPropValue('id', id, treeData);

const findAllByPropValue = (prop: string, value: string | boolean, treeData?: TreeData[]): TreeData[] => {
    let result: TreeData[] = [];

    if (treeData !== null) {

        for (const nodeData of treeData!) {
            if ((nodeData as any)[prop] === value) {
                result.push(nodeData);
            }

            result = result.concat(findAllByPropValue(prop, value, nodeData.children));
        }
    }

    return result;
};

export { findById, findByPropValue, findAllByPropValue };
