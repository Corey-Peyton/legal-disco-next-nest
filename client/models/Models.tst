${
	//This is used from: https://github.com/frhagn/Typewriter/issues/166
    // Enable extension methods by adding using Typewriter.Extensions.*
    using Typewriter.Extensions.Types;

    string Imports(Class c)
    {
        IEnumerable<Type> types = c.Properties
            .Select(p => p.Type)
            .Where(t => !t.IsPrimitive || t.IsEnum)
            .Select(t => t.IsGeneric ? t.TypeArguments.First() : t)
            .Where(t => t.Name != c.Name)
            .Distinct();
        return string.Join(Environment.NewLine, types.Select(t => $"import {{ {t.Name} }} from './{t.Name}';").Distinct());
    }
}$Classes(ecdiscoModels.*)[$Imports

export interface $Name {$Properties[
    $name: $Type;]
}]$Enums(ecdiscoModels.*)[export enum $Name {$Values[
    $Name = $Value][,]
}]
