import { Language } from "../model";
import { queryItems } from "../../queries";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as unit from "../../queries/items/call-unit";

const body = 'block';
const callUnits = [
    unit.queryItem({
        unit: 'function_definition', body: body,
        name: 'identifier', args: 'parameters',
    }),
    new QueryItem(tags.unit.unit, 'lambda', [
        new Alternation(null, [
            new QueryItem(tags.unit.args, 'lambda_parameters'),
            new QueryItem(tags.unit.body, 'expression'),
        ],),
    ]),
];
const jumps = queryItems(tags.jump, [
    'return_statement', 'await',
    'raise_statement', 'assert_statement',
    'break_statement', 'continue_statement',
]);
const loops = loopItems([
    'for_statement', 'while_statement',
]);
const flows: QueryItem[] = [
    // todo
/*

( if_statement [ 
( block ) @body
( elif_clause 
( block ) @body ) @flow
( else_clause 
( block ) @body ) @flow 
] ) @flow

( match_statement
( block 
( case_clause ) @body
) ) @flow

( try_statement [
( block ) @body
( except_clause
( block ) @body ) @flow
( except_group_clause
( block ) @body ) @flow
( else_clause
( block ) @body ) @flow
( finally_clause
( block ) @body ) @flow
] ) @flow

*/
];

export const Python: Language = {
    vscodeId: 'python',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};

function elseItem(query: QueryItem[]): QueryItem[] {
    query.push(new QueryItem(tags.flow.flow, 'else_clause', [
        new QueryItem(tags.flow.body, body),
    ]));
    return [new Alternation(null, query)];
}

function loopItems(types: string[]): QueryItem[] {
    return types.map(type =>
        new QueryItem(tags.loop.loop, type, elseItem([
            new QueryItem(tags.loop.body, body),
        ]))
    );
}
