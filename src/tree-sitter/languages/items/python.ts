import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as block from "../../queries/items/block";
import * as unit from "../../queries/items/call-unit";

const body = 'block';
const callUnits = [
    unit.queryItem({
        item: 'function_definition', body: body,
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
    return [new Alternation(null, query.concat([
        new QueryItem(tags.flow.item, 'else_clause', [
            new QueryItem(tags.flow.body, body),
        ]),
    ]))];
}

function loopItems(types: string[]): QueryItem[] {
    return types.map(type =>
        new QueryItem(tags.loop.item, type, elseItem([
            new QueryItem(tags.loop.body, body),
        ]))
    );
}
