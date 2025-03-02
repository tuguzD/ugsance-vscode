import { Language } from ".";
import { Alternation, QueryItem, queryItems } from "../queries";
import { tags } from "../queries/tag";
import * as unit from "../queries/call-unit";

export const Python: Language = {
    vscodeId: 'python',
    jump: queryItems(tags.jump, [
        'return_statement', 'await',
        'raise_statement', 'assert_statement',
        'break_statement', 'continue_statement',
    ]),
    callUnit: [
        unit.queryItem({
            unit: 'function_definition', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
        new QueryItem(tags.unit.unit, 'lambda', [
            new Alternation(null, [
                new QueryItem(tags.unit.args, 'lambda_parameters'),
                new QueryItem(tags.unit.body, 'expression'),
            ],),
        ]),
    ],
};
