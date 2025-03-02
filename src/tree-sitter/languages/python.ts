import { Language } from ".";
import { Alternation, QueryItem } from "../queries";
import * as unit from "../queries/call-unit";

export const Python: Language = {
    vscodeId: 'python',
    callUnit: [
        unit.queryItem({
            unit: 'function_definition', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
        new QueryItem(unit.tag.unit, 'lambda', [
            new Alternation(null, [
                new QueryItem(unit.tag.args, 'lambda_parameters'),
                new QueryItem(unit.tag.body, 'expression'),
            ],),
        ]),
    ],
};
