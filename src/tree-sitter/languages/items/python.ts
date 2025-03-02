import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as unit from "../../queries/items/call-unit";

const callUnits = [
    unit.queryItem({
        item: 'function_definition', body: 'block',
        name: 'identifier', args: 'parameters',
    }),
    new QueryItem(tags.unit.item, 'lambda', [
        new Alternation(null, [
            new QueryItem(tags.unit.args, 'lambda_parameters'),
            new QueryItem(tags.unit.body, 'expression'),
        ],),
    ]),
];
const jumps = block.items(tags.jump, [
    'return_statement', 'await',
    'raise_statement', 'assert_statement',
    'break_statement', 'continue_statement',
]);
const flows = [
    ...flow.items(tags.flow, ['if_statement'],
        ['elif_clause', 'else_clause'],
    'block'),
    ...flow.items(tags.flow, ['match_statement'],
        ['block'], 'case_clause', false, false, false,
    ),
    ...flow.items(tags.flow, ['try_statement'], [
        'except_clause', 'except_group_clause',
        'else_clause', 'finally_clause',
    ], 'block'),
];
const loops = flow.items(tags.loop,
    ['for_statement', 'while_statement'],
    ['else_clause'], 'block',
);

export const Python: Language = {
    vscodeId: 'python',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};
