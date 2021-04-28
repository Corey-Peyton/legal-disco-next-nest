export enum Operation {
    EqualTo = 1,
    NotEqualTo = 2,
    GreaterThan = 5,
    GreaterThanEqualTo = 6,
    LessThan = 3,
    LessThanEqualTo = 4,
    Between = 7,
    Contains = 8,
    DoesNotContain = 9,
    StartsWith = 10,
    EndsWith = 11,
    In = 12,
    NotIn = 13,
    IsEmpty = 14,
    IsNotEmpty = 15,
}

export enum OneDriveOperation {
    eq = Operation.EqualTo,
    ne = Operation.NotEqualTo,
    gt = Operation.GreaterThan,
    ge = Operation.EqualTo,
    lt = Operation.LessThan,
    le = Operation.LessThanEqualTo,
    // and	Logical and	price le 200 and price gt 3.5
    // or	Logical or	price le 3.5 or price gt 200
    // ( )	Precedence grouping	(priority eq 1 or city eq 'Redmond') and price gt 100
}

