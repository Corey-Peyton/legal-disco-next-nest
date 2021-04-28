import { FieldType } from '@/enums/field-type';

const updateValue = (id: string | null, property: string, value: string | null | boolean) =>
    (obj: any): boolean => {
        if (id === null) { // Pass null if you want to reset entire tree
            obj[property] = null;
        } else if (obj.id === id) {
            switch (obj.fieldType) {
                case FieldType.Checkbox:
                case FieldType.Radio:
                    obj[property] = true;
                    break;
                case FieldType.DateTime:
                    obj[property] = new Date(value as string);
                    break;
                case FieldType.Number:
                    obj[property] = Number(value);
                    break;
                case FieldType.Tag:
                    break;
                case FieldType.Text:
                    obj[property] = value;
            }

            return true;
        }
        if (obj.children?.length) {
            return obj.children.some(updateValue(id, property, value));
        }

        return false;
    };

export { updateValue };
