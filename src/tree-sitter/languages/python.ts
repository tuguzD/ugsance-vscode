import { Language } from ".";
import { Alternation, QueryItem, queryItems } from "../queries";
import { tags } from "../queries/tag";
import * as unit from "../queries/call-unit";

const body = 'block';
export const Python: Language = {
    vscodeId: 'python',
    jump: queryItems(tags.jump, [
        'return_statement', 'await',
        'raise_statement', 'assert_statement',
        'break_statement', 'continue_statement',
    ]),
    loop: loopItems([
        'for_statement', 'while_statement',
    ]),
    callUnit: [
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
    ],
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
